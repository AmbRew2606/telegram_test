package main

import (
	"log"
	"os"

	"github.com/AmbRew2606/telegram_test/internal/api"
	"github.com/AmbRew2606/telegram_test/pkg/storage"
	"github.com/AmbRew2606/telegram_test/pkg/telegram"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	// загрузка env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Ошибка загрузки .env файла:", err)
	}

	// инициализация бд
	db, err := storage.InitDB()
	if err != nil {
		log.Fatal("Не удалось подключиться к базе данных:", err)
	}

	// сид тестовых данных
	if err := storage.SeedTestData(db); err != nil {
		log.Fatal("Ошибка при сидировании:", err)
	}

	// запуск телеги горутиной
	go func() {
		token := os.Getenv("TELEGRAM_BOT_TOKEN")
		if token == "" {
			log.Fatal("TELEGRAM_BOT_TOKEN не найден в переменных окружения")
		}

		bot, err := telegram.NewBot(token, db)
		if err != nil {
			log.Fatalf("Ошибка при создании Telegram-бота: %v", err)
		}

		bot.Start()
	}()

	// запуск файбера
	app := fiber.New()

	// middleware для CORS, чтобы разрешить запросы с фронтенда
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173", // запросы только с этого адреса
		AllowMethods:     "GET,POST,PUT,DELETE",
		AllowHeaders:     "Origin, Content-Type, Accept",
		AllowCredentials: true,
	}))

	//приложение React будет собираться в эту папку
	app.Static("/", "./frontend/dist")

	//  маршруты API
	api.InitHandlers(db)
	api.SetupRoutes(app)

	log.Println("Сервер запущен на http://localhost:8081")
	if err := app.Listen(":8081"); err != nil {
		log.Fatal("Ошибка при запуске сервера:", err)
	}
}
