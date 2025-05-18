package apis

import (
	blockutils "chat-app-backend/Block/Utils"
	utils "chat-app-backend/Utils"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
)

type friends struct {
	Friends string `json:"friend"`
	Id      int    `json:"id"`
}

func Friends(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	User, err := store.Get(r, "Login-session")
	fmt.Println("Request User:", User.Values["username"])
	if utils.HandleError(w, err, "Cannot get login session", http.StatusInternalServerError) {
		return
	}
	if User.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	name := User.Values["username"]
	var recieverId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", name).Scan(&recieverId)
	if utils.HandleError(w, err, "Error getting reciever ID", http.StatusInternalServerError) {
		return
	}
	rows, err := DB.Query("SELECT id,Friend1 FROM friends WHERE Friend2 = ? ", recieverId)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	defer rows.Close()

	var friendList []friends
	for rows.Next() {
		var friend int
		var friendId int
		if err := rows.Scan(&friendId, &friend); utils.HandleError(w, err, "Error reading data", http.StatusInternalServerError) {
			return
		}
		var friendName string
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", friend).Scan(&friendName)
		if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
			return
		}
		friendList = append(friendList, friends{friendName, friendId})
	}
	rows, err = DB.Query("SELECT id,Friend2 FROM friends WHERE Friend1 = ?", recieverId)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var friend int
		var friendId int
		if err := rows.Scan(&friendId, &friend); utils.HandleError(w, err, "Error reading data", http.StatusInternalServerError) {
			return
		}
		var friendName string
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", friend).Scan(&friendName)
		if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
			return
		}
		friendList = append(friendList, friends{friendName, friendId})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(friendList)

}
func ImportUsers(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {

	loginUser, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "User not logged in", http.StatusUnauthorized) {
		return
	}
	if loginUser.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	users, err := DB.Query("SELECT username FROM users WHERE username != ?", loginUser.Values["username"])
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	var id int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", loginUser.Values["username"]).Scan(&id)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	blockedUsers, _, _, err := blockutils.Blocked(DB, id, "blocked_by")
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	blockedUsers2, _, _, err := blockutils.Blocked(DB, id, "blocked")
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	blockedUsers = append(blockedUsers, blockedUsers2...)
	var blockedUsersMap = make(map[string]bool)
	for _, blockedUser := range blockedUsers {
		var username string
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", blockedUser).Scan(&username)
		if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
			return
		}
		blockedUsersMap[username] = true
	}
	fmt.Print(blockedUsersMap)
	defer users.Close()

	var usernames []string
	for users.Next() {
		var username string
		if err := users.Scan(&username); utils.HandleError(w, err, "Error scanning username", http.StatusInternalServerError) {
			return
		}
		if _, exists := blockedUsersMap[username]; exists {
			continue
		}
		usernames = append(usernames, username)
	}

	w.Header().Set("Content-Type", "application/json")
	fmt.Print(usernames)
	json.NewEncoder(w).Encode(usernames)
}

func ImportMessages(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	User, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Error getting session", http.StatusInternalServerError) {
		return
	}
	reciever := r.URL.Query().Get("reciever")
	if reciever == "" {
		http.Error(w, "Reciever is required", http.StatusBadRequest)
		return
	}
	var messages []struct {
		Sender    string    `json:"sender"`
		Reciever  string    `json:"reciever"`
		Message   string    `json:"message"`
		CreatedAt time.Time `json:"created_at"`
		ID        int       `json:"id"`
	}
	var recieverId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", reciever).Scan(&recieverId)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	var senderId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", User.Values["username"]).Scan(&senderId)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}

	rows, err := DB.Query("SELECT id,sender, receiver, message, created_at FROM messages WHERE (sender = ? AND receiver = ?) OR (receiver = ? AND sender = ?)", senderId, recieverId, senderId, recieverId)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var msg struct {
			Sender    string    `json:"sender"`
			Reciever  string    `json:"reciever"`
			Message   string    `json:"message"`
			CreatedAt time.Time `json:"created_at"`
			ID        int       `json:"id"`
		}
		var createdAt string
		var messageID int
		var senderId, recieverId int
		if err := rows.Scan(&messageID, &senderId, &recieverId, &msg.Message, &createdAt); utils.HandleError(w, err, "Error reading data", http.StatusInternalServerError) {
			return
		}
		msg.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if utils.HandleError(w, err, "Error parsing time", http.StatusInternalServerError) {
			return
		}
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", senderId).Scan(&msg.Sender)
		if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
			return
		}
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", recieverId).Scan(&msg.Reciever)
		if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
			return
		}
		msg.ID = messageID

		messages = append(messages, msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func SentRequests(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	User, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Error getting session", http.StatusInternalServerError) {
		return
	}
	var sentRequests []struct {
		ID        int       `json:"id"`
		Reciever  string    `json:"reciever"`
		CreatedAt time.Time `json:"created_at"`
	}
	name := User.Values["username"]
	var senderId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", name).Scan(&senderId)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {

		return
	}
	rows, err := DB.Query("SELECT id,receiver, created_at FROM requests WHERE sender = ? AND status=?", senderId, "pending")
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var request struct {
			ID        int       `json:"id"`
			Reciever  string    `json:"reciever"`
			CreatedAt time.Time `json:"created_at"`
		}
		var createdAt string
		var recieverId int
		if err := rows.Scan(&request.ID, &recieverId, &createdAt); utils.HandleError(w, err, "Error reading data", http.StatusInternalServerError) {
			return
		}
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", recieverId).Scan(&request.Reciever)
		if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
			return
		}
		request.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if utils.HandleError(w, err, "Error parsing time", http.StatusInternalServerError) {
			return
		}
		sentRequests = append(sentRequests, request)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sentRequests)

}
func RecievedRequests(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	User, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Error getting session", http.StatusInternalServerError) {
		return
	}
	var recievedRequests []struct {
		ID        int       `json:"id"`
		Sender    string    `json:"sender"`
		CreatedAt time.Time `json:"created_at"`
	}
	name := User.Values["username"]
	var recieverId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", name).Scan(&recieverId)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	rows, err := DB.Query("SELECT id,sender, created_at FROM requests WHERE receiver = ? AND status=?", recieverId, "pending")
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var request struct {
			ID        int       `json:"id"`
			Sender    string    `json:"sender"`
			CreatedAt time.Time `json:"created_at"`
		}
		var createdAt string
		var senderId int
		if err := rows.Scan(&request.ID, &senderId, &createdAt); utils.HandleError(w, err, "Error reading rows", http.StatusInternalServerError) {
			return
		}
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", senderId).Scan(&request.Sender)
		if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
			return
		}
		request.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if utils.HandleError(w, err, "Error parsing time", http.StatusInternalServerError) {
			return
		}
		recievedRequests = append(recievedRequests, request)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recievedRequests)

}
func UserActivity(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	userName, err := utils.GiveUserName(store, r)
	if utils.HandleError(w, err, "Error getting session", http.StatusInternalServerError) {
		return
	}
	if userName == "" {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	type Activity struct {
		ID        int       `json:"id"`
		Username  string    `json:"username"`
		Activity  string    `json:"activity"`
		CreatedAt time.Time `json:"created_at"`
	}

	var userActivity []Activity
	var Id int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", userName).Scan(&Id)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	rows, err := DB.Query("SELECT id,Evnt, createdAt FROM events WHERE relatedTo = ?", Id)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	defer rows.Close()
	for rows.Next() {
		var activity Activity
		var createdAt string
		if err := rows.Scan(&activity.ID, &activity.Activity, &createdAt); utils.HandleError(w, err, "Error reading data", http.StatusInternalServerError) {
			return
		}
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", Id).Scan(&activity.Username)
		if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
			return
		}
		activity.CreatedAt, err = time.Parse("2006-01-02 15:04:05", createdAt)
		if utils.HandleError(w, err, "Error parsing time", http.StatusInternalServerError) {
			return
		}
		userActivity = append(userActivity, activity)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(userActivity)

}
func BlockedUsers(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	username, err := utils.GiveUserName(store, r)
	if err != nil {
		if err.Error() == "userName not found in session" {
			utils.HandleError(w, err, "User not logged in", http.StatusUnauthorized)
			return
		}
		utils.HandleError(w, err, "Failed to get username from session", http.StatusInternalServerError)
		return
	}
	var userId int
	err = DB.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userId)
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	blockedUsers, blockedID, createdAt, err := blockutils.Blocked(DB, userId, "blocked_by")
	if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
		return
	}
	type blockedUser struct {
		ID        int    `json:"id"`
		Username  string `json:"username"`
		CreatedAt string `json:"created_at"`
	}
	var blockedUserName []blockedUser
	for i := 0; i < len(blockedUsers); i++ {
		var username string
		err = DB.QueryRow("SELECT username FROM users WHERE id = ?", blockedUsers[i]).Scan(&username)
		if utils.HandleError(w, err, "Error quering database", http.StatusInternalServerError) {
			return
		}
		blockedUserName = append(blockedUserName, blockedUser{blockedID[i], username, createdAt[i]})
	}
	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(blockedUserName)
}
