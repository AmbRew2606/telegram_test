package services

import (
	"github.com/AmbRew2606/telegram_test/pkg/models"
	"gorm.io/gorm"
)

// for page /sections
type SectionStats struct {
	ID        uint   `json:"id"`        // ID раздела
	Name      string `json:"name"`      // Название раздела
	Topics    int    `json:"topics"`    // Количество тем
	Questions int    `json:"questions"` // Количество вопросов
}

type SectionService struct {
	DB *gorm.DB
}

func NewSectionService(db *gorm.DB) *SectionService {
	return &SectionService{DB: db}
}

func (s *SectionService) CreateSection(name string) (*models.Section, error) {
	section := &models.Section{Name: name}
	if err := s.DB.Create(section).Error; err != nil {
		return nil, err
	}
	return section, nil
}

func (s *SectionService) GetAllSectionsWithTopics() ([]models.Section, error) {
	var sections []models.Section
	if err := s.DB.Preload("Topics").Find(&sections).Error; err != nil {
		return nil, err
	}
	return sections, nil
}

func (s *SectionService) GetSectionStats() ([]SectionStats, error) {
	var stats []SectionStats

	query := `
	SELECT 
	  s.id AS id,           -- ID раздела
	  s.name AS name, 
	  COUNT(DISTINCT t.id) AS topics, 
	  COUNT(q.id) AS questions
	FROM sections s
	LEFT JOIN topics t ON s.id = t.section_id
	LEFT JOIN questions q ON t.id = q.topic_id
	GROUP BY s.id, s.name;
	`

	if err := s.DB.Raw(query).Scan(&stats).Error; err != nil {
		return nil, err
	}

	return stats, nil
}
