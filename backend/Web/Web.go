package Web

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
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

	ReadConfig()

	router := gin.Default()
	var address string = getConfig().IP + ":" + getConfig().Port


	// set cors configurations
	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://" + address}
	config.AllowHeaders = []string{"Origin", "Content-Type"}
	config.AllowMethods = []string{"POST"}
	config.AllowCredentials = true

	router.Use(cors.New(config))


	// TODO implement global rate limiting

	router.SetTrustedProxies(nil)
	defineRoutes(router)
	router.Static("/", "../frontend/dist")
	router.Run(address)
}

// define get/post routes here
func defineRoutes(r *gin.Engine) {

	loginLimiter := rate.NewLimiter(rate.Limit(1.0/60.0), 3)
	generalLimiter := rate.NewLimiter(rate.Limit(1.0/60.0), 100)

	// unprotected API routes
	r.POST("/login", RateLimitMiddleware(loginLimiter), handleLogin)
	r.POST("/logout", RateLimitMiddleware(generalLimiter), handleLogout)

	protected := r.Group("/")
	protected.Use(AuthenticationMiddleware())
	protected.Use(RateLimitMiddleware(generalLimiter))

	// protected API routes
	protected.POST("/files", getFileDirectory)
	protected.POST("/stream", streamFile)
	protected.POST("/upload", uploadFile)
}
