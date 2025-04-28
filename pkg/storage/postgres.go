package storage

import (
	"log"
	"os"

	"github.com/AmbRew2606/telegram_test/pkg/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Println("Не удалось подключиться к БД:", err)
		return nil, err
	}

	err = db.AutoMigrate(
		&models.Section{},
		&models.Topic{},
		&models.Question{},
		&models.Answer{},
		&models.Message{},
	)
	if err != nil {
		log.Println("Ошибка миграции:", err)
		return nil, err
	}

	log.Println("База данных инициализирована и промигрирована")
	return db, nil
}
