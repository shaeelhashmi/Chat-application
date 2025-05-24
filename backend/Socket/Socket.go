package Socket

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Message struct {
	Sender   string `json:"sender"`
	Reciever string `json:"reciever"`
	Message  string `json:"message"`
	DeleteID int    `json:"deleteID"`
}
type MessageResponse struct {
	Sender   string `json:"sender"`
	Reciever string `json:"reciever"`
	Message  string `json:"message"`
	Time     string `json:"created_at"`
	Id       int    `json:"id"`
	ToSender bool   `json:"toSender"`
}

var Connections = make(map[string]*websocket.Conn)
var mu sync.Mutex
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func SendMessage(receiver string, msg []byte) {
	mu.Lock()
	conn, exists := Connections[receiver]
	mu.Unlock()
	if exists {
		err := conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			mu.Lock()
			delete(Connections, receiver) // Remove disconnected clients
			mu.Unlock()
		}
	}
}

func SocketHandler(w http.ResponseWriter, r *http.Request, DB *sql.DB) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if utils.HandleError(w, err, "Failed to upgrade transaction", http.StatusInternalServerError) {
		return
	}
	defer conn.Close()

	mu.Lock()

	fmt.Println("Active Connections:", Connections) // Debugging line
	mu.Unlock()

	var sender string
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
		var messageData Message
		if err := json.Unmarshal(msg, &messageData); err != nil {
			fmt.Println("Invalid JSON format:", err)
			continue
		}
		sender = messageData.Sender
		receiver := messageData.Reciever
		msg1 := messageData.Message
		deleteID := messageData.DeleteID

		Connections[sender] = conn
		fmt.Println("Message received from", sender, ":", string(msg1))
		if receiver == "" {
			fmt.Println("Receiver is empty, skipping message")
			continue
		}
		if deleteID > 0 {
			type Delete struct {
				DeleteID int `json:"deleteId"`
			}
			var response Delete
			response.DeleteID = deleteID
			responseBytes, err := json.Marshal(response)
			if err != nil {
				continue
			}
			fmt.Println("Deleting message")
			SendMessage(receiver, responseBytes)
			SendMessage(sender, responseBytes)
			continue
		}
		if msg1 == "" {
			continue
		}
		stmt, err := DB.Prepare("INSERT INTO messages (sender, receiver, message) VALUES (?, ?, ?)")
		if err != nil {
			errMsg := fmt.Sprintf("Failed to insert message into database: %v", err)
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
			conn.Close()
			return
		}
		defer stmt.Close()
		var SenderID int
		err = DB.QueryRow("SELECT id FROM users WHERE username = ?", sender).Scan(&SenderID)
		if err != nil {
			fmt.Println("Error fetching sender ID:", err)
			errMsg := fmt.Sprintf("Failed to fetch sender ID: %v", err)
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
			conn.Close()
			return
		}
		var ReceiverID int
		err = DB.QueryRow("SELECT id FROM users WHERE username = ?", receiver).Scan(&ReceiverID)
		if err != nil {
			fmt.Println("Error fetching receiver ID:", err)
			errMsg := fmt.Sprintf("Failed to fetch receiver ID: %v", err)
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
			conn.Close()
			return
		}
		result, err := stmt.Exec(SenderID, ReceiverID, msg1)
		if err != nil {
			fmt.Println("Error executing statement:", err)
			errMsg := fmt.Sprintf("Failed to execute statement: %v", err)
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
			conn.Close()
			return
		}
		lastID, err := result.LastInsertId()
		if err != nil {
			fmt.Println("Error getting last insert ID:", err)
			errMsg := fmt.Sprintf("Failed to get last insert ID: %v", err)
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
			conn.Close()
			return
		}
		response := MessageResponse{
			messageData.Sender,
			messageData.Reciever,
			messageData.Message,
			time.Now().Format("2006-01-02 15:04:05"),
			int(lastID),
			false,
		}
		resposeBytes, err := json.Marshal(response)
		if err != nil {
			fmt.Println("Error marshalling response:", err)
			continue
		}
		go SendMessage(receiver, resposeBytes)
		response.ToSender = true
		resposeBytes, err = json.Marshal(response)
		if err != nil {
			fmt.Println("Error marshalling response:", err)
			continue
		}
		go SendMessage(sender, resposeBytes)
	}

	mu.Lock()
	delete(Connections, sender)
	mu.Unlock()
}
