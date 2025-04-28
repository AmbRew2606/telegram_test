package api

import (
	"github.com/AmbRew2606/telegram_test/pkg/models"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitHandlers(db *gorm.DB) {
	DB = db
}

func GetSections(c *fiber.Ctx) error {
	var sections []models.Section
	if err := DB.Preload("Topics").Find(&sections).Error; err != nil {
		c.Locals("error", err)
		return c.Status(500).JSON(fiber.Map{"error": "Ошибка при получении разделов", "details": err.Error()})
	}

	if len(sections) == 0 {
		return c.Status(404).JSON(fiber.Map{"message": "Разделы не найдены"})
	}

	return c.JSON(sections)
}
