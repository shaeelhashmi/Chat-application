package users

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/gorilla/sessions"
)

func ImportUsers(w http.ResponseWriter, r *http.Request, DB *sql.DB, store *sessions.CookieStore) {

	loginUser, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	users, err := DB.Query("SELECT username FROM users WHERE username != ?", loginUser.Values["username"])
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer users.Close()

	var usernames []string
	for users.Next() {
		var username string
		if err := users.Scan(&username); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		usernames = append(usernames, username)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(usernames)

}
