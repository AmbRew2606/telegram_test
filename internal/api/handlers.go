package api

import (
	"strconv"

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
func CreateSection(c *fiber.Ctx) error {
	var req struct {
		Name   string   `json:"name"`
		Topics []string `json:"topics"` // Добавляем поле для тем
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Неверный формат данных",
		})
	}

	section, err := sectionService.CreateSection(req.Name, req.Topics)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Ошибка при создании раздела",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(section)
}

// Темы по ID раздела
func GetTopicsBySectionID(c *fiber.Ctx) error {
	sectionIDParam := c.Params("sectionId")
	sectionID, err := strconv.Atoi(sectionIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid sectionId"})
	}

	topics, err := sectionService.GetTopicsBySectionID(uint(sectionID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось получить темы"})
	}

	if topics == nil {
		topics = make([]services.TopicInfo, 0)
	}

	return c.JSON(topics)
}

func GetFilteredTopics(c *fiber.Ctx) error {
	sectionIDParam := c.Query("sectionId")
	filter := c.Query("filter", "")

	sectionID, err := strconv.Atoi(sectionIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid sectionId"})
	}

	topics, err := sectionService.GetFilteredTopics(uint(sectionID), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось получить темы"})
	}

	return c.JSON(topics)
}
