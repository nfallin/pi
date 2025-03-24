package Web

import (
	"backend/File"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"github.com/gin-gonic/gin"
)



func cleanDirectory(dir string) string {
	return filepath.Clean(strings.ToLower(strings.TrimSpace(dir)))
}

// *****************
// * API Functions *
// *****************

// set to the same parent directory defined in the frontend's config.json
var parentDir = cleanDirectory("C:/Users/sidek")

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

	// verify parent directory is maintained
	if (err0 != nil || !strings.HasPrefix(absoluteDir, parentDir)) {
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
	if (err0 != nil || !strings.HasPrefix(absoluteDir, parentDir)) {
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
		directory = parentDir
	}

	// clean the inputted directory
	absoluteDir, err := filepath.Abs(directory)
	absoluteDir = cleanDirectory(absoluteDir)
	
	// verify parent directory is maintained
	if (err != nil || !strings.HasPrefix(absoluteDir, parentDir)) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access Denied"})
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
	err4 := c.SaveUploadedFile(file, filePath) 
	if (err4 != nil) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "path": filePath})
}