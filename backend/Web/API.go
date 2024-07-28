package Web

import (
	"backend/File"
	"encoding/json"
	"fmt"
	"net/http"

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
