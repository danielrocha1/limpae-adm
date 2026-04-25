package handlers

import (
	"limpae/go/src/config"
	"limpae/go/src/models"

	"github.com/gofiber/fiber/v2"
)

// AdminGetUsers retorna todos os usuários cadastrados com seus perfis
func AdminGetUsers(c *fiber.Ctx) error {
	var users []models.User
	if err := config.DB.Preload("UserProfile").Preload("DiaristProfile").Preload("Address").Find(&users).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erro ao buscar usuários"})
	}

	return c.JSON(users)
}

// AdminGetServices retorna todos os serviços com informações de cliente e diarista
func AdminGetServices(c *fiber.Ctx) error {
	var services []models.Service
	if err := config.DB.Preload("Client").Preload("Diarist").Preload("Address").Find(&services).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erro ao buscar serviços"})
	}

	return c.JSON(services)
}

// AdminGetPayments retorna todos os pagamentos realizados ou pendentes
func AdminGetPayments(c *fiber.Ctx) error {
	var payments []models.Payment
	if err := config.DB.Find(&payments).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erro ao buscar pagamentos"})
	}

	return c.JSON(payments)
}

// AdminGetStats retorna estatísticas globais para o dashboard administrativo
func AdminGetStats(c *fiber.Ctx) error {
	var userCount, serviceCount, diaristCount int64
	var totalRevenue float64

	config.DB.Model(&models.User{}).Count(&userCount)
	config.DB.Model(&models.User{}).Where("role = ?", "diarista").Count(&diaristCount)
	config.DB.Model(&models.Service{}).Count(&serviceCount)

	config.DB.Model(&models.Payment{}).
		Where("status IN ('paid', 'pago', 'aprovado')").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalRevenue)

	return c.JSON(fiber.Map{
		"users":         userCount,
		"diarists":      diaristCount,
		"services":      serviceCount,
		"total_revenue": totalRevenue,
	})
}

// AdminGetOffers retorna todas as ofertas do mural
func AdminGetOffers(c *fiber.Ctx) error {
	var offers []models.Offer
	if err := config.DB.Preload("Client").Preload("Service").Find(&offers).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erro ao buscar ofertas"})
	}
	return c.JSON(offers)
}

// AdminGetReviews retorna todos os reviews da plataforma
func AdminGetReviews(c *fiber.Ctx) error {
	var reviews []models.Review
	if err := config.DB.Preload("Service").Preload("Client").Preload("Diarist").Find(&reviews).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erro ao buscar reviews"})
	}
	return c.JSON(reviews)
}

// AdminGetSubscriptions retorna todas as assinaturas
func AdminGetSubscriptions(c *fiber.Ctx) error {
	var subscriptions []models.Subscription
	if err := config.DB.Preload("User").Find(&subscriptions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erro ao buscar assinaturas"})
	}
	return c.JSON(subscriptions)
}
