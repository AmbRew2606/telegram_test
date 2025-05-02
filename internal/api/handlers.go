package api

import (
	"github.com/AmbRew2606/telegram_test/pkg/services"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

var sectionService *services.SectionService

func InitHandlers(db *gorm.DB) {
	sectionService = services.NewSectionService(db)
}

// Получить все разделы
func GetSections(c *fiber.Ctx) error {
	sections, err := sectionService.GetAllSectionsWithTopics()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Ошибка при получении разделов"})
	}

	//подправить
	if len(sections) == 0 {
		return c.Status(404).JSON(fiber.Map{"message": "Разделы не найдены"})
	}

	return c.JSON(sections)
}

// Получить статистику по разделам
func GetSectionStats(c *fiber.Ctx) error {
	stats, err := sectionService.GetSectionStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error":   "Не удалось получить статистику по разделам",
			"details": err.Error(),
		})
	}
	return c.JSON(stats)
}

// Добавить новый раздел
// Нужно расширить запрос, чтобы также можно было добавить темы
func CreateSection(c *fiber.Ctx) error {
	var req struct {
		Name   string   `json:"name"`
		Topics []string `json:"topics"` // Добавляем поле для тем
	}

	// Парсим тело запроса
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный формат данных",
		})
	}

	// Создаем раздел с темами
	section, err := sectionService.CreateSection(req.Name, req.Topics)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при создании раздела",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(section)
}
