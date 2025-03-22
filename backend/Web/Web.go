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

	// allow cors
	// router.Use(func(c *gin.Context) {
	// 	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	// 	c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
	// 	c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
	// 	if c.Request.Method == "OPTIONS" {
	// 		c.AbortWithStatus(http.StatusOK)
	// 		return
	// 	}
	// 	c.Next()
	// })

	// allow cors
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	config.AllowMethods = []string{"GET", "POST"}

	router.Use(cors.New(config))

	router.SetTrustedProxies(nil)
	defineRoutes(router)
	router.Static("/static", "../frontend/dist")
	// router.Run("localhost:8080")
	router.Run("0.0.0.0:8080")
}

// define get/post routes here
func defineRoutes(r *gin.Engine) {
	// api routes
	r.POST("/files", getFileDirectory)
	r.POST("/stream", streamFile)
}
