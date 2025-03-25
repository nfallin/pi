package Web

import (
	"net/http"
	"os"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)



func AuthenticationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		// obtain token
		tokenString, err := c.Cookie("auth_token")
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		// retrieve key
		secretKey, err0 := os.ReadFile("jwt_secret")
		if (err0 != nil) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve key"})
		}

		// parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, gin.Error{Err: err, Type: gin.ErrorTypePrivate}
			}
			return secretKey, nil
		})

		if (err != nil || !token.Valid) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Next()
	}
}