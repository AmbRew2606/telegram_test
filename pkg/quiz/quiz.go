package quiz

import (
	"context"

	"github.com/AmbRew2606/telegram_test/pkg/models"
	"gorm.io/gorm"
)

func GetRandomQuestion(ctx context.Context, db *gorm.DB) (*models.Question, error) {
	var q models.Question
	err := db.WithContext(ctx).Preload("Answers").Order("RANDOM()").First(&q).Error
	if err != nil {
		return nil, err
	}
	return &q, nil
}
