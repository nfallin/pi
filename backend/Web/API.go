package Web

import (
	"backend/File"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// *****************
// * API Functions *
// *****************

// curl test command:
// curl -i -X POST -H "Content-Type: application/json" -d "{\"directory\": \"C:/users/sidek\"}" localhost:8080/files
func getFileDirectory(c *gin.Context) {
	var requestBody directoryStructureBody

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println(requestBody.Directory)

	dir, err := File.GetDirectoryStructure(requestBody.Directory)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error})
	}

	var formattedDirectory File.FileInfo

	err = json.Unmarshal(dir, &formattedDirectory)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error})
	}

	c.JSON(http.StatusOK, formattedDirectory)
}

func streamFile(c *gin.Context) {
	var requestBody directoryStructureBody

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println(requestBody.Directory)
	filePath := requestBody.Directory


	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}

	// baseDir := "" // pi parent directory
	// absPath, err := filepath.Abs(filePath)
	// if err != nil || !filepath.HasPrefix(absPath, baseDir) {
	// 	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file path"})
	// 	return
	// }

	// serve the requested file here
	c.File(filePath);
}

func uploadFile(c*gin.Context) {

	file, err := c.FormFile("file");
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File not received"})
		return
	}

	directory := c.PostForm("directory")
	if (directory == "") {
		directory = "C:\\Users\\sidek" // make this the parent directory or a default designated upload directory
	}

	_, err2 := os.Stat(directory)
	if (os.IsNotExist(err2)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Directory does not exist"})
		return
	}

	filePath := fmt.Sprintf("%s/%s", directory, file.Filename)
	err3 := c.SaveUploadedFile(file, filePath) 
	if (err3 != nil) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "path": filePath})
}
