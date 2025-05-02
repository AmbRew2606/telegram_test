package api

import "github.com/gofiber/fiber/v2"

func SetupRoutes(app *fiber.App) {
	apiGroup := app.Group("/api")

	apiGroup.Get("/sections", GetSections)          //Получение разделов со списом тем
	apiGroup.Get("/sections/test", GetSectionStats) // Получение разделов с кол-вом тем и вопросов
	app.Post("/api/sections", CreateSection)        // Создание раздела

}
