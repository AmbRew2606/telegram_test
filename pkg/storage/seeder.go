package storage

import (
	"log"

	"github.com/AmbRew2606/telegram_test/pkg/models"
	"gorm.io/gorm"
)

func SeedTestData(db *gorm.DB) error {

	var count int64
	db.Model(&models.Section{}).Count(&count)
	if count > 0 {
		log.Println("Test data already exists, skipping seeding.")
		return nil
	}

	section := models.Section{Name: "Frontend"}
	if err := db.Create(&section).Error; err != nil {
		return err
	}

	topic := models.Topic{
		SectionID: section.ID,
		Name:      "Vue.js",
	}
	if err := db.Create(&topic).Error; err != nil {
		return err
	}

	question := models.Question{
		TopicID: topic.ID,
		Text:    "Какой директивой создается двусторонняя привязка в Vue?",
	}
	if err := db.Create(&question).Error; err != nil {
		return err
	}

	answers := []models.Answer{
		{QuestionID: question.ID, Text: "v-model", IsCorrect: true},
		{QuestionID: question.ID, Text: "v-bind", IsCorrect: false},
		{QuestionID: question.ID, Text: "v-if", IsCorrect: false},
	}
	if err := db.Create(&answers).Error; err != nil {
		return err
	}

	message := models.Message{
		Code: "welcome",
		Text: "Добро пожаловать в тест-бот!",
	}
	if err := db.Create(&message).Error; err != nil {
		return err
	}

	log.Println("✅ Тестовые данные успешно добавлены")
	return nil
}
