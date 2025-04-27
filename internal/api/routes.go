package api

import "github.com/gofiber/fiber/v2"

func SetupRoutes(app *fiber.App) {
	apiGroup := app.Group("/api")

	apiGroup.Get("/sections", GetSections)
}
