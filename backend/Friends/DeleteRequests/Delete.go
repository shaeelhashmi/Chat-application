package delete

import (
	"database/sql"
	"net/http"

	"github.com/gorilla/sessions"
)

func DeleteReceivedRequest(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	if r.Method != "DELETE" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	var id = r.URL.Query().Get("id")
	check := DB.QueryRow("SELECT  receiver FROM friends WHERE id=?", id)
	if check.Err() != nil {
		http.Error(w, "Failed to check if request exists", http.StatusInternalServerError)
		return
	}
	var receiver string
	err = check.Scan(&receiver)
	if err != nil {
		http.Error(w, "Failed to scan request", http.StatusInternalServerError)
		return
	}
	var recieverId string
	err = DB.QueryRow("SELECT id FROM users WHERE username=?", session.Values["username"]).Scan(&recieverId)
	if err != nil {
		http.Error(w, "Failed to get user ID", http.StatusInternalServerError)
		return
	}

	if receiver != recieverId {
		http.Error(w, "No such friend request", http.StatusNotFound)
		return
	}
	_, err = DB.Exec("DELETE FROM friends WHERE id=? AND status=?", id, "pending")
	if err != nil {
		http.Error(w, "Failed to delete friend request", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Friend request deleted successfully"))

}
func DeleteSentRequest(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {
	if r.Method != "DELETE" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "User not logged in", http.StatusUnauthorized)
		return
	}
	var id = r.URL.Query().Get("id")
	check := DB.QueryRow("SELECT  sender FROM friends WHERE id=?", id)
	if check.Err() != nil {
		http.Error(w, "Failed to check if request exists", http.StatusInternalServerError)
		return
	}
	var sender string
	err = check.Scan(&sender)
	if err != nil {
		http.Error(w, "Failed to scan request", http.StatusInternalServerError)
		return
	}
	if sender != session.Values["username"] {
		http.Error(w, "No such friend request", http.StatusNotFound)
		return
	}
	_, err = DB.Exec("DELETE FROM friends WHERE id=? AND status=?", id, "pending")
	if err != nil {
		http.Error(w, "Failed to delete friend request", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Friend request deleted successfully"))
}
