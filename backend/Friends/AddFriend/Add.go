package requests

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	blockutils "chat-app-backend/Block/Utils"
	utils "chat-app-backend/Utils"

	"github.com/go-sql-driver/mysql"
	"github.com/gorilla/sessions"
)

func SendFriendRequest(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	var username struct {
		Username string `json:"username"`
	}
	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Failed to get session", http.StatusInternalServerError) {
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	user := session.Values["username"].(string)
	fmt.Println("AddFriend: ", r.Body)

	data, err := io.ReadAll(r.Body)
	if utils.HandleError(w, err, "Failed to read request body", http.StatusBadRequest) {
		return
	}
	err = json.Unmarshal(data, &username)
	if utils.HandleError(w, err, "Failed to unmarshal request body", http.StatusBadRequest) {
		return
	}
	var userID int
	err = DB.QueryRow("select id from users where username=?", user).Scan(&userID)
	if utils.HandleError(w, err, "Failed to get user ID", http.StatusInternalServerError) {
		return
	}
	if username.Username == user {
		http.Error(w, "Cannot add yourself as a friend", http.StatusBadRequest)
		return
	}
	Blocked, _, _, err := blockutils.Blocked(DB, userID, "blocked")
	if utils.HandleError(w, err, "Failed to get blocked users", http.StatusInternalServerError) {
		return
	}
	Blocked2, _, _, err := blockutils.Blocked(DB, userID, "blocked_by")
	if utils.HandleError(w, err, "Failed to get blocked users", http.StatusInternalServerError) {
		return
	}
	Blocked = append(Blocked, Blocked2...)
	var friendID int
	err = DB.QueryRow("SELECT id FROM users WHERE username=?", username.Username).Scan(&friendID)
	if utils.HandleError(w, err, "Failed to get friend ID", http.StatusInternalServerError) {
		return
	}
	for _, blockedUser := range Blocked {
		if blockedUser == friendID {
			http.Error(w, "Cannot send friend request to blocked user", http.StatusBadRequest)
			return
		}
	}

	tx, err := DB.Begin()
	if utils.HandleError(w, err, "Failed to begin transaction", http.StatusInternalServerError) {
		return
	}
	defer tx.Rollback()
	var exists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username=?)", username.Username).Scan(&exists)
	if utils.HandleError(w, err, "Failed to check if user exists", http.StatusInternalServerError) {
		return
	}
	if !exists {
		http.Error(w, "User does not exist", http.StatusNotFound)
		return
	}
	var userId int
	err = DB.QueryRow("SELECT id FROM users WHERE username=?", user).Scan(&userId)
	if utils.HandleError(w, err, "Failed to get user ID", http.StatusInternalServerError) {

		return
	}
	var friendId int
	err = DB.QueryRow("SELECT id FROM users WHERE username=?", username.Username).Scan(&friendId)
	if utils.HandleError(w, err, "Failed to get friend ID", http.StatusInternalServerError) {
		return
	}

	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM requests WHERE sender=? AND receiver=?)", userId, friendId).Scan(&exists)
	if utils.HandleError(w, err, "Failed to check if friend request exists", http.StatusInternalServerError) {
		return
	}
	if exists {
		http.Error(w, "Friend request already exists", http.StatusConflict)
		return
	}
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM requests WHERE sender=? AND receiver=?)", friendId, userId).Scan(&exists)
	if utils.HandleError(w, err, "Failed to check if friend request exists", http.StatusInternalServerError) {
		return
	}
	if exists {
		http.Error(w, "Friend request already exists", http.StatusConflict)
		return
	}
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM friends WHERE (Friend1=? AND Friend2=?) OR (Friend1=? AND Friend2=?))", userId, friendId, friendId, userId).Scan(&exists)
	if utils.HandleError(w, err, "Failed to check if users are already friends", http.StatusInternalServerError) {
		return
	}
	if exists {
		http.Error(w, "Users are already friends", http.StatusConflict)
		return
	}
	_, err = tx.Exec("INSERT INTO requests (sender, receiver) VALUES (?, ?)", userId, friendId)
	if err != nil {
		if mysqlErr, ok := err.(*mysql.MySQLError); ok && mysqlErr.Number == 1062 {
			http.Error(w, "Friend request already exists", http.StatusConflict)
			return
		}
		http.Error(w, "Failed to insert friend request", http.StatusInternalServerError)
		return
	}
	_, err = tx.Exec("INSERT INTO events (Evnt,relatedTo) VALUES (?,?)", fmt.Sprintf("Sent friend request to %s", username.Username), userId)
	if utils.HandleError(w, err, "Failed to insert event", http.StatusInternalServerError) {
		return
	}
	_, err = tx.Exec("INSERT INTO events (Evnt,relatedTo) VALUES (?,?)", fmt.Sprintf("Received friend request from %s", user), friendId)
	if utils.HandleError(w, err, "Failed to insert event", http.StatusInternalServerError) {
		return
	}
	err = tx.Commit()
	if utils.HandleError(w, err, "Failed to commit transaction", http.StatusInternalServerError) {
		return
	}
	w.WriteHeader(http.StatusOK)
}
func AcceptRequests(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Failed to get session", http.StatusInternalServerError) {
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	userName := session.Values["username"].(string)

	data, err := io.ReadAll(r.Body)
	if utils.HandleError(w, err, "Failed to read request body", http.StatusBadRequest) {
		return
	}
	tx, err := DB.Begin()
	if utils.HandleError(w, err, "Failed to begin transaction", http.StatusInternalServerError) {
		return
	}
	defer tx.Rollback()
	var id struct {
		ID int
	}
	err = json.Unmarshal(data, &id)
	if utils.HandleError(w, err, "Failed to unmarshal request body", http.StatusBadRequest) {
		return
	}
	_, err = tx.Exec("UPDATE requests SET status = 'accepted' WHERE id=?", id.ID)
	if utils.HandleError(w, err, "Failed to update request status", http.StatusInternalServerError) {
		return
	}
	var receiverID, senderID int

	err = DB.QueryRow("SELECT sender, receiver FROM requests WHERE id=?", id.ID).Scan(&senderID, &receiverID)
	if utils.HandleError(w, err, "Failed to get user ID", http.StatusInternalServerError) {
		return
	}
	_, err = tx.Exec("INSERT INTO friends (Friend1, Friend2) VALUES (?, ?)", senderID, receiverID)
	if utils.HandleError(w, err, "Failed to insert friend", http.StatusInternalServerError) {
		return
	}
	_, err = tx.Exec("DELETE FROM requests WHERE id=?", id.ID)
	if utils.HandleError(w, err, "Failed to delete request", http.StatusInternalServerError) {
		return
	}
	var friendName string
	err = DB.QueryRow("SELECT username FROM users WHERE id=?", senderID).Scan(&friendName)
	if utils.HandleError(w, err, "Failed to get friend name", http.StatusInternalServerError) {
		return
	}
	_, err = tx.Exec("INSERT INTO events (Evnt,relatedTo) VALUES (?,?)", fmt.Sprintf("Became friends with %s", friendName), receiverID)
	if utils.HandleError(w, err, "Failed to insert event", http.StatusInternalServerError) {
		return
	}
	_, err = tx.Exec("INSERT INTO events (Evnt,relatedTo) VALUES (?,?)", fmt.Sprintf("Became friends with %s", userName), senderID)
	if utils.HandleError(w, err, "Failed to insert event", http.StatusInternalServerError) {
		return
	}
	err = tx.Commit()
	if utils.HandleError(w, err, "Failed to commit transaction", http.StatusInternalServerError) {
		return
	}
	w.WriteHeader(http.StatusOK)
}
