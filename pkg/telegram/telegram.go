package telegram

import (
	"context"
	"fmt"
	"log"
	"strconv"
	"sync"
	"time"

	"github.com/AmbRew2606/telegram_test/pkg/models"
	"github.com/AmbRew2606/telegram_test/pkg/quiz"
	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api"
	"gorm.io/gorm"
)

type Bot struct {
	api      *tgbotapi.BotAPI
	db       *gorm.DB
	sessions map[int64]*Session
	mu       sync.RWMutex // для оптимизации
}

type Session struct {
	Score      int
	CurrentQ   *models.Question
	LastActive time.Time
}

func NewBot(token string, db *gorm.DB) (*Bot, error) {
	bot, err := tgbotapi.NewBotAPI(token)
	if err != nil {
		return nil, fmt.Errorf("failed to create bot: %w", err)
	}

	bot.Debug = true // логирование

	return &Bot{
		api:      bot,
		db:       db,
		sessions: make(map[int64]*Session),
	}, nil
}

func (b *Bot) Start() {
	u := tgbotapi.NewUpdate(0)
	u.Timeout = 60
	updates, err := b.api.GetUpdatesChan(u)
	if err != nil {
		log.Fatalf("Failed to get updates channel: %v", err)
	}

	// очистку старых сессий в фоне (горутиной)
	go b.cleanupSessions()

	for update := range updates {
		go b.handleUpdate(update) // конккурентная обработка обновлений
	}
}

func (b *Bot) handleUpdate(update tgbotapi.Update) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Recovered from panic in handleUpdate: %v", r)
		}
	}()

	start := time.Now()
	defer func() {
		log.Printf("Handled update in %v", time.Since(start))
	}()

	if update.CallbackQuery != nil {
		b.handleCallback(update.CallbackQuery)
		return
	}

	if update.Message != nil && update.Message.IsCommand() {
		b.handleCommand(update.Message)
	}
}

func (b *Bot) handleCallback(callback *tgbotapi.CallbackQuery) {
	userID := callback.From.ID
	answerID, err := strconv.Atoi(callback.Data)
	if err != nil {
		b.sendText(int64(userID), "Ошибка при обработке ответа.")
		return
	}

	// проверка сессий с RLock
	b.mu.RLock()
	session, exists := b.sessions[int64(userID)]
	b.mu.RUnlock()

	if !exists || session.CurrentQ == nil {
		b.sendText(int64(userID), "Квиз не начался, напиши /start")
		return
	}

	// обработка ответа
	var selected *models.Answer
	for i := range session.CurrentQ.Answers {
		if int(session.CurrentQ.Answers[i].ID) == answerID {
			selected = &session.CurrentQ.Answers[i]
			break
		}
	}

	if selected == nil {
		b.sendText(int64(userID), "Неизвестный вариант ответа")
		return
	}

	// обновление сессии
	b.mu.Lock()
	if selected.IsCorrect {
		session.Score++
		b.sendText(int64(userID), fmt.Sprintf("✅ Правильно! Твой счет: %d", session.Score))
	} else {
		b.sendText(int64(userID), fmt.Sprintf("❌ Неправильно. Правильный ответ: %s", getCorrectAnswer(session.CurrentQ)))
	}
	session.LastActive = time.Now()
	b.mu.Unlock()

	// отправка следующего вопроса
	b.sendQuestion(int64(userID), session)

	// быстрый ответ на callback чтобы избежать задержки
	if _, err := b.api.AnswerCallbackQuery(tgbotapi.NewCallback(callback.ID, "")); err != nil {
		log.Printf("Callback answer error: %v", err)
	}
}

func (b *Bot) handleCommand(msg *tgbotapi.Message) {
	switch msg.Command() {
	case "start", "restart":
		userID := msg.From.ID

		b.mu.Lock()
		b.sessions[int64(userID)] = &Session{
			Score:      0,
			LastActive: time.Now(),
		}
		b.mu.Unlock()

		b.sendText(int64(userID), "Привет! Добро пожаловать в квиз!")
		b.sendQuestion(int64(userID), b.sessions[int64(userID)])
	case "score":
		userID := msg.From.ID
		b.mu.RLock()
		session, exists := b.sessions[int64(userID)]
		b.mu.RUnlock()

		if exists {
			b.sendText(int64(userID), fmt.Sprintf("Твой текущий счет: %d", session.Score))
		} else {
			b.sendText(int64(userID), "Сначала начни квиз командой /start")
		}
	}
}

func (b *Bot) sendQuestion(userID int64, session *Session) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	question, err := quiz.GetRandomQuestion(ctx, b.db)
	if err != nil {
		log.Printf("Failed to get question: %v", err)
		b.sendText(userID, "Ошибка при получении вопроса. Попробуй еще раз.")
		return
	}

	b.mu.Lock()
	session.CurrentQ = question
	session.LastActive = time.Now()
	b.mu.Unlock()

	// форматирование сообщения
	msgText := fmt.Sprintf("❓ Вопрос:\n%s\n\nВыбери ответ:", question.Text)

	// КЛАВА
	var rows [][]tgbotapi.InlineKeyboardButton
	for _, ans := range question.Answers {
		btn := tgbotapi.NewInlineKeyboardButtonData(
			fmt.Sprintf("%d. %s", ans.ID, ans.Text),
			strconv.Itoa(int(ans.ID)),
		)
		rows = append(rows, []tgbotapi.InlineKeyboardButton{btn})
	}

	msg := tgbotapi.NewMessage(userID, msgText)
	msg.ReplyMarkup = tgbotapi.NewInlineKeyboardMarkup(rows...)

	if _, err := b.api.Send(msg); err != nil {
		log.Printf("Failed to send question: %v", err)
	}
}

func (b *Bot) sendText(chatID int64, text string) {
	msg := tgbotapi.NewMessage(chatID, text)
	msg.ParseMode = tgbotapi.ModeMarkdown // для лучшего форматирования

	if _, err := b.api.Send(msg); err != nil {
		log.Printf("Failed to send message: %v", err)
	}
}

func (b *Bot) cleanupSessions() {
	ticker := time.NewTicker(30 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		b.mu.Lock()
		now := time.Now()
		for id, session := range b.sessions {
			if now.Sub(session.LastActive) > 2*time.Hour {
				delete(b.sessions, id)
			}
		}
		b.mu.Unlock()
	}
}

func getCorrectAnswer(q *models.Question) string {
	for _, ans := range q.Answers {
		if ans.IsCorrect {
			return ans.Text
		}
	}
	return ""
}
