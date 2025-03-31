package Socket

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Message struct {
	Sender   string `json:"sender"`
	Reciever string `json:"reciever"`
	Message  string `json:"message"`
}

var connections = make(map[string]*websocket.Conn)
var mu sync.Mutex
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func SendMessage(receiver string, msg []byte) {
	mu.Lock()
	conn, exists := connections[receiver]
	mu.Unlock()

	if exists {
		fmt.Println("Sending message to:", receiver)
		fmt.Println("Message:", string(msg))
		err := conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			fmt.Println("Error sending message:", err)
			mu.Lock()
			delete(connections, receiver) // Remove disconnected clients
			mu.Unlock()
		}
	} else {
		fmt.Println("Receiver not found in connections:", receiver)
	}
}

func SocketHandler(w http.ResponseWriter, r *http.Request, DB *sql.DB) {
	tx, err := DB.Begin()
	if err != nil {
		fmt.Println("Error beginning transaction:", err)
		http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()
	_, err = DB.Exec("CREATE TABLE IF NOT EXISTS messsages (id INT AUTO_INCREMENT PRIMARY KEY, sender VARCHAR(255), reciever VARCHAR(255), message TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
	if err != nil {
		fmt.Println("Error duting transaction:", err)
		http.Error(w, "Failed to prepare statement", http.StatusInternalServerError)
		return
	}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade connection", http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	mu.Lock()

	fmt.Println("Active Connections:", connections) // Debugging line
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
		connections[sender] = conn
		fmt.Println("Message received from", sender, ":", string(msg1))
		msg1bytes := []byte(msg1)
		stmt, err := DB.Prepare("INSERT INTO messsages (sender, reciever, message) VALUES (?, ?, ?)")
		if err != nil {
			fmt.Println("Error inserting message into database:", err)
			errMsg := fmt.Sprintf("Failed to insert message into database: %v", err)
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
			conn.Close()
			return
		}
		defer stmt.Close()
		_, err = stmt.Exec(sender, receiver, msg1)
		if err != nil {
			fmt.Println("Error executing statement:", err)
			errMsg := fmt.Sprintf("Failed to execute statement: %v", err)
			conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
			conn.Close()
			return
		}

		go SendMessage(receiver, msg1bytes)
	}

	mu.Lock()
	delete(connections, sender)
	mu.Unlock()
}
