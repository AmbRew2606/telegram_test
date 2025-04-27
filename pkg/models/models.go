package models

import "time"

type Section struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	Topics    []Topic   `gorm:"foreignKey:SectionID" json:"topics,omitempty"`
}

type Topic struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	SectionID uint       `json:"section_id"`
	Name      string     `json:"name"`
	CreatedAt time.Time  `json:"created_at"`
	Questions []Question `gorm:"foreignKey:TopicID" json:"questions,omitempty"`
}

type Question struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TopicID   uint      `json:"topic_id"`
	Text      string    `json:"text"`
	CreatedAt time.Time `json:"created_at"`
	Answers   []Answer  `gorm:"foreignKey:QuestionID" json:"answers,omitempty"`
}

type Answer struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	QuestionID uint   `json:"question_id"`
	Text       string `json:"text"`
	IsCorrect  bool   `json:"is_correct"`
}

type Message struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Code string `gorm:"unique" json:"code"`
	Text string `json:"text"`
}
