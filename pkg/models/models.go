package models

import "time"

// Модель Section
type Section struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"` // автоматически заполняется
	Topics    []Topic   `gorm:"foreignKey:SectionID" json:"topics,omitempty"`
}

// Модель Topic
type Topic struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	SectionID uint       `json:"section_id"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	Questions []Question `gorm:"foreignKey:TopicID" json:"questions,omitempty"`
}

// Модель Question
type Question struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TopicID   uint      `json:"topic_id"`
	Text      string    `json:"text"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	Answers   []Answer  `gorm:"foreignKey:QuestionID" json:"answers,omitempty"`
}

// Модель Answer
type Answer struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	QuestionID uint   `json:"question_id"`
	Text       string `json:"text"`
	IsCorrect  bool   `json:"is_correct"`
}

// Модель Message
type Message struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Code string `gorm:"unique" json:"code"`
	Text string `json:"text"`
}
