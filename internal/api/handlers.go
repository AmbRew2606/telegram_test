package api

import (
	"strconv"

	"github.com/AmbRew2606/telegram_test/pkg/models"
	"github.com/AmbRew2606/telegram_test/pkg/services"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CreateQuestionInput struct {
	SectionID uint          `json:"section_id"`
	TopicID   uint          `json:"topic_id"`
	Text      string        `json:"text"`
	Answers   []AnswerInput `json:"answers"`
}

type AnswerInput struct {
	Text      string `json:"text"`
	IsCorrect bool   `json:"is_correct"`
}

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
		Topics []string `json:"topics"`
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
	sectionIDParam := c.Query("sectionId")
	sectionID, err := strconv.Atoi(sectionIDParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid sectionId"})
	}

	topics, err := sectionService.GetTopicsBySectionID(uint(sectionID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось получить темы"})
	}

	if topics == nil {
		topics = []services.TopicInfo{}
	}

	return c.JSON(topics)
}

func GetFilteredTopics(c *fiber.Ctx) error {
	sectionID, err := strconv.Atoi(c.Query("sectionId"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid sectionId"})
	}

	filter := c.Query("filter", "")

	topics, err := sectionService.GetFilteredTopics(uint(sectionID), filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось получить темы"})
	}

	if topics == nil {
		topics = []services.TopicInfo{}
	}

	return c.JSON(topics)
}

func GetQuestionsHandler(c *fiber.Ctx) error {
	sectionID, err1 := strconv.Atoi(c.Query("sectionId"))
	topicID, err2 := strconv.Atoi(c.Query("topicId"))
	if err1 != nil || err2 != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid sectionId or topicId"})
	}

	questions, err := sectionService.GetQuestions(uint(sectionID), uint(topicID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось получить вопросы"})
	}

	if questions == nil {
		questions = []services.QuestionInfo{}
	}

	return c.JSON(questions)
}

func AddQuestionHandler(c *fiber.Ctx) error {
	var input CreateQuestionInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Невалидный JSON"})
	}

	if input.Text == "" || len(input.Answers) < 2 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Вопрос и хотя бы два ответа обязательны"})
	}

	hasCorrect := false
	for _, a := range input.Answers {
		if a.IsCorrect {
			hasCorrect = true
			break
		}
	}
	if !hasCorrect {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Хотя бы один ответ должен быть правильным"})
	}

	var exists bool
	err := sectionService.DB.Raw(`
		SELECT EXISTS(
			SELECT 1 FROM topics WHERE id = ? AND section_id = ?
		)`, input.TopicID, input.SectionID).Scan(&exists).Error
	if err != nil || !exists {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Такой темы в разделе не существует"})
	}

	err = sectionService.DB.Transaction(func(tx *gorm.DB) error {
		question := models.Question{
			Text:    input.Text,
			TopicID: input.TopicID,
		}
		if err := tx.Create(&question).Error; err != nil {
			return err
		}

		for _, a := range input.Answers {
			answer := models.Answer{
				Text:       a.Text,
				IsCorrect:  a.IsCorrect,
				QuestionID: question.ID,
			}
			if err := tx.Create(&answer).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Не удалось сохранить вопрос и ответы"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{"message": "Вопрос успешно добавлен"})
}

func DeleteQuestion(c *fiber.Ctx) error {
	idParam := c.Params("id")
	questionID, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Некорректный ID"})
	}

	err = sectionService.DeleteQuestion(uint(questionID))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Ошибка при удалении"})
	}

	return c.JSON(fiber.Map{"message": "Вопрос удалён"})
}
