package config

import (
	"fmt"
	"log"
	"os"

	"limpae/go/src/models"

	"golang.org/x/crypto/bcrypt"

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

	SeedAdmin()

	fmt.Println("Banco de dados conectado e migrado com sucesso!")
}

func SeedAdmin() {
	var admin models.User
	email := "admin@limpae.com"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)

	if err := DB.Where("email = ?", email).First(&admin).Error; err != nil {
		// Admin não existe, vamos criar
		admin = models.User{
			Name:            "Administrador",
			Email:           email,
			PasswordHash:    string(hashedPassword),
			Role:            "admin",
			Phone:           11999999999,
			Cpf:             "00000000000",
			Photo:           "https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff",
			EmailVerified:   true,
			EmailVerifiedAt: func() *time.Time { t := time.Now(); return &t }(),
		}
		if err := DB.Create(&admin).Error; err != nil {
			fmt.Printf("Aviso: Não foi possível criar o usuário admin padrão: %v\n", err)
		} else {
			fmt.Println("Usuário admin padrão criado com sucesso (admin@limpae.com / admin123)")
		}
	} else {
		// Admin existe, vamos garantir que a senha e o cargo estejam corretos para o acesso inicial
		DB.Model(&admin).Updates(models.User{
			PasswordHash:  string(hashedPassword),
			Role:          "admin",
			EmailVerified: true,
		})
		fmt.Println("Usuário admin padrão atualizado (admin@limpae.com / admin123)")
	}
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
