package services

import (
	"github.com/AmbRew2606/telegram_test/pkg/models"
	"gorm.io/gorm"
)

type SectionStats struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Topics    int    `json:"topics"`
	Questions int    `json:"questions"`
}

type TopicInfo struct {
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	QuestionsCount int    `json:"questions"`
}

type AnswerInfo struct {
	ID        uint   `json:"id"`
	Text      string `json:"text"`
	IsCorrect bool   `json:"is_correct"`
}

type QuestionInfo struct {
	ID      uint         `json:"id"`
	Text    string       `json:"text"`
	Answers []AnswerInfo `json:"answers" gorm:"-"`
}

type SectionService struct {
	DB *gorm.DB
}

func NewSectionService(db *gorm.DB) *SectionService {
	return &SectionService{DB: db}
}

func (s *SectionService) CreateSection(name string, topics []string) (*models.Section, error) {
	section := &models.Section{Name: name}
	if err := s.DB.Create(section).Error; err != nil {
		return nil, err
	}

	for _, topicName := range topics {
		topic := &models.Topic{Name: topicName, SectionID: section.ID}
		if err := s.DB.Create(topic).Error; err != nil {
			return nil, err
		}
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
	  s.id AS id,          
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

func (s *SectionService) GetTopicsBySectionID(sectionID uint) ([]TopicInfo, error) {
	var topics []TopicInfo
	query := `
	SELECT 
		t.id AS id,
		t.name AS name,
		COUNT(q.id) AS questions_count
	FROM topics t
	LEFT JOIN questions q ON t.id = q.topic_id
	WHERE t.section_id = ?
	GROUP BY t.id, t.name;
	`
	if err := s.DB.Raw(query, sectionID).Scan(&topics).Error; err != nil {
		return nil, err
	}
	return topics, nil
}

func (s *SectionService) GetFilteredTopics(sectionID uint, filter string) ([]TopicInfo, error) {
	var topics []TopicInfo
	query := `
	SELECT 
		t.id AS id,
		t.name AS name,
		COUNT(q.id) AS questions_count
	FROM topics t
	LEFT JOIN questions q ON t.id = q.topic_id
	WHERE t.section_id = ? AND t.name LIKE ?
	GROUP BY t.id, t.name;
	`
	if err := s.DB.Raw(query, sectionID, "%"+filter+"%").Scan(&topics).Error; err != nil {
		return nil, err
	}

	if topics == nil {
		topics = []TopicInfo{}
	}

	return topics, nil
}

// func (s *SectionService) GetQuestions(sectionID, topicID uint) ([]QuestionInfo, error) {
// 	var questions []QuestionInfo

// 	query := `
//     SELECT
//         q.id, q.text
//     FROM questions q
//     INNER JOIN topics t ON q.topic_id = t.id
//     WHERE t.section_id = ? AND q.topic_id = ?
//     `
// 	if err := s.DB.Raw(query, sectionID, topicID).Scan(&questions).Error; err != nil {
// 		return nil, err
// 	}

// 	return questions, nil
// }

func (s *SectionService) GetQuestions(sectionID, topicID uint) ([]QuestionInfo, error) {
	var questions []QuestionInfo

	query := `
	SELECT q.id, q.text
	FROM questions q
	JOIN topics t ON q.topic_id = t.id
	WHERE t.section_id = ? AND q.topic_id = ?
	`
	if err := s.DB.Raw(query, sectionID, topicID).Scan(&questions).Error; err != nil {
		return nil, err
	}

	for i := range questions {
		var answers []AnswerInfo
		err := s.DB.Raw(`SELECT id, text, is_correct FROM answers WHERE question_id = ?`, questions[i].ID).Scan(&answers).Error
		if err != nil {
			return nil, err
		}
		questions[i].Answers = answers
	}

	return questions, nil
}
