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

type loginStructureBody struct {
	Password string `json:"password" binding:"required"`
}

// starts the router
func Serve() {

	router := gin.Default()
	var localAddress string = "0.0.0.0:8080"

	// set cors configurations
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://" + localAddress, "http://localhost:8080", "http://192.168.1.145:8080"}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	config.AllowMethods = []string{"POST"}
	config.AllowCredentials = true

	router.Use(cors.New(config))


	// TODO implement global rate limiting

	router.SetTrustedProxies(nil)
	defineRoutes(router)
	router.Static("/", "../frontend/dist")
	router.Run(localAddress)
}

// define get/post routes here
func defineRoutes(r *gin.Engine) {

	// unprotected API routes
	r.POST("/login", handleLogin)
	r.POST("/logout", handleLogout)

	protected := r.Group("/")
	protected.Use(AuthenticationMiddleware())

	// protected API routes
	protected.POST("/files", getFileDirectory)
	protected.POST("/stream", streamFile)
	protected.POST("/upload", uploadFile)
}
