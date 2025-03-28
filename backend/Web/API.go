package Web

import (
	"time"
	"backend/File"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func cleanDirectory(dir string) string {
	return filepath.Clean(strings.TrimSpace(dir))
}


// *****************
// * API Functions *
// *****************

// when the user navigates to a new directory, return all subpaths of that directory to display in the explorer list
func getFileDirectory(c *gin.Context) {
	var requestBody directoryStructureBody

	// verify request
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// clean the inputted directory
	absoluteDir, err0 := filepath.Abs(requestBody.Directory)
	absoluteDir = cleanDirectory(absoluteDir)

	fmt.Println("request body: ", requestBody.Directory)
	fmt.Println("absoluteDir: ", absoluteDir)
	fmt.Println("parent from config: ", getConfig().Home)

	// verify parent directory is maintained
	if (err0 != nil || !strings.HasPrefix(absoluteDir, getConfig().Home)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// get a list of all the contents of the directory
	dir, err := File.GetDirectoryStructure(absoluteDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve directory contents"})
		return
	}

	// format and return the directory contents
	var formattedDirectory File.FileInfo
	err = json.Unmarshal(dir, &formattedDirectory)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse info"})
		return
	}

	c.JSON(http.StatusOK, formattedDirectory)
}

// 500MB file size limit - adjust as needed
const maxDownloadSize = 500 * 1024 * 1024

// when the user requests to view a file, find it in storage and return it as a blob
func streamFile(c *gin.Context) {
	var requestBody directoryStructureBody

	// verify request
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// clean the inputted directory
	absoluteDir, err0 := filepath.Abs(requestBody.Directory)
	absoluteDir = cleanDirectory(absoluteDir)

	// verify parent directory is maintained
	if (err0 != nil || !strings.HasPrefix(absoluteDir, getConfig().Home)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// verify the requested file exists
	fileStats, err := os.Stat(absoluteDir)
	if (os.IsNotExist(err)) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	// verify the file isn't too large to return
	if (fileStats.Size() > maxDownloadSize) {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "File is too large"})
		return
	}

	// serve the requested file here
	c.File(absoluteDir);
}

// 100MB limit - adjust as needed
const maxUploadSize = 100 * 1024 * 1024

// when the user uploads a file, write it to the user's current directory
func uploadFile(c*gin.Context) {

	// verify request
	file, err0 := c.FormFile("file");
	if err0 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File not received"})
		return
	}

	// prevent large file uploads
	if (file.Size > maxUploadSize) {
		c.JSON(http.StatusRequestEntityTooLarge, gin.H{"error": "File is too large"})
		return
	}

	// default to parent directory
	directory := c.PostForm("directory")
	if (directory == "") {
		directory = getConfig().Home
	}

	// clean the inputted directory
	absoluteDir, err := filepath.Abs(directory)
	absoluteDir = cleanDirectory(absoluteDir)
	
	// verify parent directory is maintained
	if (err != nil || !strings.HasPrefix(absoluteDir, getConfig().Home)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access Denied"})
		return
	}

	// verify directory exists
	_, err4 := os.Stat(absoluteDir)
	if (os.IsNotExist(err4)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Directory does not exist"})
    	return
	}
	
	filePath := fmt.Sprintf("%s/%s", absoluteDir, file.Filename)

	// prevent overwriting files that already exist
	_, err3 := os.Stat(filePath)
	if (err3 == nil) {
		c.JSON(http.StatusConflict, gin.H{"error": "File already exists"})
		return
	} 

	// save the file
	err5 := c.SaveUploadedFile(file, filePath) 
	if (err5 != nil) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "path": filePath})
}

func handleLogin(c* gin.Context) {
	var requestBody loginStructureBody

	// verify request
	if err := c.ShouldBindJSON(&requestBody); (err != nil) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request"})
		return
	}

	// read password from credentials file
	password, err := os.ReadFile("credentials")
	if (err != nil) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retreive credentials"})
		return
	}

	// disgusting hardcoded password (will change later)
	if (requestBody.Password != string(password)) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"username": "Nolan", "exp": time.Now().Add(time.Hour).Unix(),})

	secretKey, err0 := os.ReadFile("jwt_secret")
	if (err0 != nil) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve key"})
	}
	
	tokenString, err := token.SignedString([]byte(secretKey))
	if (err != nil) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.SetCookie("auth_token", tokenString, 3600, "/", getConfig().IP, false, true)

	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

func handleLogout(c *gin.Context) {
	c.SetCookie("auth_token", "", -1, "/", getConfig().IP, false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}