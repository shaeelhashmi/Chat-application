package Exists

import (
	utils "chat-app-backend/Utils"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gorilla/sessions"
)

func Exists(w http.ResponseWriter, r *http.Request, db *sql.DB, store *sessions.CookieStore) {
	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Error getting session", http.StatusInternalServerError) {
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	username := session.Values["username"].(string)

	if username == "" {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	friendUsername := r.URL.Query().Get("friend")
	if friendUsername == "" {
		http.Error(w, "Friend username not provided", http.StatusBadRequest)
		return
	}
	friendShipID := r.URL.Query().Get("friendid")
	fmt.Println(friendShipID)
	if friendShipID == "" {

		http.Error(w, "Friend ID not provided", http.StatusBadRequest)
		return
	}
	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM friends WHERE id=?)", friendShipID).Scan(&exists)
	if utils.HandleError(w, err, "Error checking if friend exists", http.StatusInternalServerError) {
		return
	}
	if exists {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Friendship exists"))
		return
	}

	var userID int

	err = db.QueryRow("SELECT id FROM users WHERE username=?", username).Scan(&userID)
	if utils.HandleError(w, err, "Error checking if friend exists", http.StatusInternalServerError) {
		return
	}
	var friendID int
	err = db.QueryRow("SELECT id FROM users WHERE username=?", friendUsername).Scan(&friendID)
	if utils.HandleError(w, err, "Error checking if friend exists", http.StatusInternalServerError) {
		return
	}
	exists, err = CheckFriendShip(db, userID, friendID)
	if utils.HandleError(w, err, "Error checking if friend exists", http.StatusInternalServerError) {
		return
	}
	if !exists {
		http.Error(w, "Friendship does not exist", http.StatusNotFound)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Friendship exists"))
}
func CheckFriendShip(db *sql.DB, friend1 int, friend2 int) (bool, error) {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM friends WHERE Friend1 = ? AND Friend2 = ?)", friend1, friend2).Scan(&exists)
	if err != nil {
		return false, err
	}
	if exists {
		return true, nil
	}
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM friends WHERE Friend2 = ? AND Friend1 = ?)", friend2, friend1).Scan(&exists)
	if err != nil {
		return false, err
	}
	if exists {
		return true, nil
	}
	return false, nil
}
