package Auth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/gorilla/sessions"
)

// Replace with your own secret key

func Login(w http.ResponseWriter, r *http.Request, store *sessions.CookieStore) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	type User struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	var user User
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	json.Unmarshal(body, &user)
	defer r.Body.Close()
	fmt.Println(user.Username, user.Password)

	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}
	if user.Username == "shaeel" && user.Password == "123" {
		session.Values["username"] = user.Username
		session.Save(r, w)
		response := map[string]string{
			"message": "Login successful",
			"user":    user.Username,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	} else {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
	}
}
func IsloggedIn(w http.ResponseWriter, r *http.Request, store *sessions.CookieStore) {
	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}
	response := map[string]string{
		"message": "Logged in",
		"user":    session.Values["username"].(string),
	}
	fmt.Println("Logged in user:", session.Values["username"].(string))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
func Logout(w http.ResponseWriter, r *http.Request, store *sessions.CookieStore) {
	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}
	session.Values["username"] = nil
	session.Save(r, w)
	response := map[string]string{
		"message": "Logged out",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
