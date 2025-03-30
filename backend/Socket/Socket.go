package Socket

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

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

func SocketHandler(w http.ResponseWriter, r *http.Request, sender string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Failed to upgrade connection", http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	mu.Lock()
	connections[sender] = conn
	fmt.Println("Active Connections:", connections) // Debugging line
	mu.Unlock()

	receiver := r.URL.Query().Get("receiver")
	fmt.Println("Receiver:", receiver)
	if receiver == "" {
		conn.WriteMessage(websocket.TextMessage, []byte("Receiver not found"))
	}

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
		fmt.Println("Message received from", sender, ":", string(msg))
		go SendMessage(receiver, msg)
	}

	mu.Lock()
	delete(connections, sender)
	mu.Unlock()
}
