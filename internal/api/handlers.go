package api

import (
	"github.com/AmbRew2606/telegram_test/pkg/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Инициализация DB
func InitHandlers(db *gorm.DB) {
	DB = db
}

// Получение разделов с подгруженными темами
func GetSections(c *fiber.Ctx) error {
	var sections []models.Section
	// Добавление Preload для загрузки связанных данных (например, Topics)
	if err := DB.Preload("Topics").Find(&sections).Error; err != nil {
		// Логируем ошибку на сервере
		c.Locals("error", err) // Можно использовать локальные данные для логирования
		return c.Status(500).JSON(fiber.Map{"error": "Ошибка при получении разделов", "details": err.Error()})
	}

	if len(sections) == 0 {
		return c.Status(404).JSON(fiber.Map{"message": "Разделы не найдены"})
	}

	return c.JSON(sections)
}
