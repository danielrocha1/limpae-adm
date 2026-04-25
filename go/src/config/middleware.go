package config

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

// Carregar variáveis de ambiente do .env
func init() {
	err := godotenv.Load("./src/config/.env")
	if err != nil {
		log.Println("Aviso: Arquivo .env não encontrado, usando variáveis de ambiente do sistema")
	}
}

func runningUnderGoTest() bool {
	binaryName := filepath.Base(os.Args[0])
	return strings.Contains(binaryName, ".test")
}

// JWTMiddleware valida o token e armazena o ID do usuário no contexto
func JWTMiddleware(c *fiber.Ctx) error {
	tokenString := ExtractBearerToken(c)
	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token ausente"})
	}

	user, err := ParseJWTToken(tokenString)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	log.Println("JWT autenticado para o usuário", user.ID, "com papel", user.Role)

	c.Locals("user_id", user.ID)
	c.Locals("email", user.Email)
	c.Locals("role", user.Role)

	return c.Next()
}

// AdminMiddleware garante que apenas usuários com o papel 'admin' possam prosseguir
func AdminMiddleware(c *fiber.Ctx) error {
	role := c.Locals("role")
	if role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Acesso negado: requer privilégios de administrador"})
	}
	return c.Next()
}
