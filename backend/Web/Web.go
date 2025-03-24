package Web

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// ***************************
// * POST request structures *
// ***************************

type directoryStructureBody struct {
	Directory string `json:"directory" binding:"required"`
}

// starts the router
func Serve() {

	router := gin.Default()
	var localAddress string = "0.0.0.0:8080"

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://" + localAddress, "http://localhost:8080"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	config.AllowMethods = []string{"POST"}

	router.Use(cors.New(config))

	router.SetTrustedProxies(nil)
	defineRoutes(router)
	router.Static("/", "../frontend/dist")
	router.Run(localAddress)
}

// define get/post routes here
func defineRoutes(r *gin.Engine) {
	// api routes
	r.POST("/files", getFileDirectory)
	r.POST("/stream", streamFile)
	r.POST("/upload", uploadFile)
}
