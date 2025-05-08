package api

import "github.com/gofiber/fiber/v2"

func SetupRoutes(app *fiber.App) {
	apiGroup := app.Group("/api")

	apiGroup.Get("/sections", GetSections)                            // Получение разделов со списком тем
	apiGroup.Get("/sections/test", GetSectionStats)                   // Получение статистики по разделам
	apiGroup.Get("/sections/:sectionId/topics", GetTopicsBySectionID) // Получение тем по ID раздела
	apiGroup.Get("/topics", GetFilteredTopics)                        // Получение тем с фильтрацией по разделу и фильтру
	apiGroup.Get("/questions", GetQuestionsHandler)                   //  вопросы по sectionId и topicId

	apiGroup.Post("/sections", CreateSection) // Создание раздела
}
