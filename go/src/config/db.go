package config

import (
	"fmt"
	"log"
	"os"

	"limpae/go/src/models"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	err := godotenv.Load("./src/config/.env")
	if err != nil {
		log.Fatal("Erro ao carregar o .env:", err)
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("A variavel de ambiente DATABASE_URL nao esta configurada.")
	}

	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Erro ao conectar ao banco de dados:", err)
	}

	// 1. Remover a restrição antiga que bloqueia o cargo 'admin'
	fmt.Println("Limpando restrições de cargo antigas...")
	DB.Exec("ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_users_role")
	DB.Exec("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check")

	// 2. Rodar a migração para criar as tabelas e a nova restrição
	err = DB.AutoMigrate(
		&models.User{},
		&models.EmailVerificationToken{},
		&models.Address{},
		&models.AddressRoom{},
		&models.Diarists{},
		&models.UserProfile{},
		&models.Service{},
		&models.Payment{},
		&models.Review{},
		&models.Subscription{},
		&models.Offer{},
		&models.OfferNegotiation{},
		&models.ChatRoom{},
		&models.ChatRoomUser{},
		&models.ChatMessage{},
		&models.ChatMessageRead{},
		&models.ChatLocation{},
		&models.StripeWebhookEvent{},
	)
	if err != nil {
		log.Fatal("Erro ao migrar tabelas:", err)
	}

	if err := ensureServiceTypeColumnLength(); err != nil {
		log.Fatal("Erro ao alinhar tamanho de service_type:", err)
	}

	// Forçar role admin para o usuário específico solicitado
	targetEmail := "daniel.rochats@gmail.com"
	if err := DB.Model(&models.User{}).Where("email = ?", targetEmail).Update("role", "admin").Error; err != nil {
		fmt.Printf("Aviso: Não foi possível atualizar role para %s: %v\n", targetEmail, err)
	} else {
		fmt.Printf("Sucesso: Role 'admin' garantida para %s\n", targetEmail)
	}

	fmt.Println("Banco de dados conectado e migrado com sucesso!")
}

func ensureServiceTypeColumnLength() error {
	statements := []string{
		`ALTER TABLE services ALTER COLUMN service_type TYPE varchar(500);`,
		`ALTER TABLE offers ALTER COLUMN service_type TYPE varchar(500);`,
	}

	for _, statement := range statements {
		if err := DB.Exec(statement).Error; err != nil {
			return err
		}
	}

	return nil
}
