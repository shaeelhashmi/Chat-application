package Socket

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	GiveFriends "chat-app-backend/Friends/Utils"

	"github.com/gorilla/websocket"
)

type Message struct {
	Sender   string `json:"sender"`
	Reciever string `json:"reciever"`
	Message  string `json:"message"`
	DeleteID int    `json:"deleteID"`
	Type     string `json:"type"` // Added type field to distinguish message types
}
type MessageResponse struct {
	Type     string `json:"type"` // Added type field to distinguish message types
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
		if messageData.Type == "logout" {
			sender = messageData.Sender
			break
		}
		if messageData.Type == "test" {

			sessionID := messageData.Sender
			err = DB.QueryRow("SELECT username FROM sessions WHERE sessionID = ?", sessionID).Scan(&sender)
			if err != nil {
				fmt.Println("Error fetching sender username:", err)
				errMsg := fmt.Sprintf("Failed to fetch sender username: %v", err)
				conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
				conn.Close()
				return
			}
			Connections[sender] = conn
			for key := range Connections {
				var userID int
				err = DB.QueryRow("SELECT id FROM users WHERE username=?", key).Scan(&userID)
				if err != nil {

					continue
				}
				if !SendOnlineUsers(userID, DB, key) {
					continue
				}

			}

			continue

		}
		if messageData.Type == "message" {
			sessionID := messageData.Sender
			receiver := messageData.Reciever
			msg1 := messageData.Message
			deleteID := messageData.DeleteID

			err = DB.QueryRow("SELECT username FROM sessions WHERE sessionID = ?", sessionID).Scan(&sender)
			if err != nil {
				fmt.Println("Error fetching sender username:", err)
				errMsg := fmt.Sprintf("Failed to fetch sender username: %v", err)
				conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
				conn.Close()
				return
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

				go SendMessage(receiver, responseBytes)
				go SendMessage(sender, responseBytes)
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
				break
			}
			defer stmt.Close()
			var SenderID int
			err = DB.QueryRow("SELECT id FROM users WHERE username = ?", sender).Scan(&SenderID)
			if err != nil {
				fmt.Println("Error fetching sender ID:", err)
				errMsg := fmt.Sprintf("Failed to fetch sender ID: %v", err)
				conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
				conn.Close()
				break
			}
			var ReceiverID int
			err = DB.QueryRow("SELECT id FROM users WHERE username = ?", receiver).Scan(&ReceiverID)
			if err != nil {
				fmt.Println("Error fetching receiver ID:", err)
				errMsg := fmt.Sprintf("Failed to fetch receiver ID: %v", err)
				conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
				conn.Close()
				break
			}
			result, err := stmt.Exec(SenderID, ReceiverID, msg1)
			if err != nil {
				fmt.Println("Error executing statement:", err)
				errMsg := fmt.Sprintf("Failed to execute statement: %v", err)
				conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
				conn.Close()
				break
			}
			lastID, err := result.LastInsertId()
			if err != nil {
				fmt.Println("Error getting last insert ID:", err)
				errMsg := fmt.Sprintf("Failed to get last insert ID: %v", err)
				conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseInternalServerErr, errMsg))
				conn.Close()
				break
			}
			response := MessageResponse{
				"message",
				sender,
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
	}

	mu.Lock()
	delete(Connections, sender)
	fmt.Println("Logging out", Connections, sender)
	for key := range Connections {
		fmt.Println("Key:", key)
		var userID int
		err = DB.QueryRow("SELECT id FROM users WHERE username=?", key).Scan(&userID)
		if err != nil {
			continue
		}
		if !SendOnlineUsers(userID, DB, key) {
			continue
		}
	}
	mu.Unlock()

}
func SendOnlineUsers(userID int, DB *sql.DB, userName string) bool {
	FriendList, err := GiveFriends.GiveFriends(DB, userID, "Friend1")
	if err != nil {

		return false
	}
	FriendList2, err := GiveFriends.GiveFriends(DB, userID, "Friend2")
	if err != nil {

		return false
	}
	FriendList = append(FriendList, FriendList2...)
	var OnlineUsers []string
	for _, friend := range FriendList {
		if _, ok := Connections[friend.Friends]; ok {
			OnlineUsers = append(OnlineUsers, friend.Friends)
		}
	}
	type response struct {
		Type   string   `json:"type"`
		Online []string `json:"OnlineUsers"`
	}
	res := response{
		Type:   "onlineUsers",
		Online: OnlineUsers,
	}
	resposeBytes, err := json.Marshal(res)
	if err != nil {
		fmt.Println("Error marshalling response:", err)
		return false
	}
	fmt.Println("Sending to:", userName)
	fmt.Println("Sending to:", res)
	go SendMessage(userName, resposeBytes)
	return true
}
