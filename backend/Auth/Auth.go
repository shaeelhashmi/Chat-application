package Auth

import (
	"crypto/rand"
	"crypto/sha512"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Replace with your own secret key
func GenerateSessionID(userName string) string {
	current_time := time.Now().UnixMilli()
	sessionID := fmt.Sprintf("%x", current_time)
	sessionID = userName + sessionID
	fmt.Println("Session ID:", sessionID)
	return sessionID
}
func Login(w http.ResponseWriter, r *http.Request, store *sessions.CookieStore, DB *sql.DB) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user User
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	json.Unmarshal(body, &user)
	defer r.Body.Close()

	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}
	var dbUser User
	var dbSalt []byte
	err = DB.QueryRow("SELECT username, password, salt FROM users WHERE username=?", user.Username).Scan(&dbUser.Username, &dbUser.Password, &dbSalt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		} else {
			http.Error(w, "Failed to query database", http.StatusInternalServerError)
		}
		return
	}
	hashedPassword := HashPassword(user.Password, dbSalt)
	if hashedPassword != dbUser.Password {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}
	session.Values["username"] = user.Username
	tx, err := DB.Begin()
	if err != nil {
		http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)

		return
	}
	defer tx.Rollback()
	_, err = tx.Exec(`CREATE TABLE IF NOT EXISTS sessions (username VARCHAR(15) NOT NULL PRIMARY KEY, sessionID VARCHAR(255) NOT NULL,
	 EndDate DATETIME DEFAULT (CURRENT_TIMESTAMP + INTERVAL 1 HOUR));`)
	if err != nil {
		http.Error(w, "Failed to create sessions table", http.StatusInternalServerError)
		return
	}
	sessionID := GenerateSessionID(user.Username)
	_, err = tx.Exec("INSERT INTO sessions (username, sessionID) VALUES (?, ?) ON DUPLICATE KEY UPDATE sessionID = VALUES(sessionID)", user.Username, sessionID)
	if err != nil {
		fmt.Print("Error inserting session:", err)
		http.Error(w, "Failed to insert session", http.StatusInternalServerError)
		return
	}
	err = session.Save(r, w)
	if err != nil {
		http.Error(w, "Failed to save session", http.StatusInternalServerError)
		return
	}
	fmt.Println("Session ID:", session.ID)
	type Response struct {
		Message string `json:"message"`
		User    string `json:"user"`
	}
	response := Response{
		Message: "Logged in successfully",
		User:    user.Username,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

}
func SignUp(w http.ResponseWriter, r *http.Request, DB *sql.DB) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user User
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	json.Unmarshal(body, &user)
	defer r.Body.Close()

	tx, err := DB.Begin()
	if err != nil {
		http.Error(w, "Failed to begin transaction", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()
	_, err = tx.Exec(`
CREATE TABLE IF NOT EXISTS users (
username VARCHAR(15) NOT NULL PRIMARY KEY,
password VARCHAR(255) NOT NULL,
salt BLOB NOT NULL
);`)
	if err != nil {
		http.Error(w, "Failed to prepare statement", http.StatusInternalServerError)
		tx.Rollback()
		return
	}
	var exists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username=?)", user.Username).Scan(&exists)
	if err != nil {
		http.Error(w, "Failed to check if user exists", http.StatusInternalServerError)
		tx.Rollback()
		return
	}
	if exists {
		http.Error(w, "Username already exists", http.StatusConflict)
		tx.Rollback()
		return
	}
	salt := generateRandomSalt(16)
	hashedPassword := HashPassword(user.Password, salt)
	_, err = tx.Exec("INSERT INTO users (username, password, salt) VALUES (?, ?, ?)", user.Username, hashedPassword, salt)
	if err != nil {
		http.Error(w, "Failed to insert user", http.StatusInternalServerError)
		tx.Rollback()
		return
	}
	if err := tx.Commit(); err != nil {
		http.Error(w, "Failed to commit transaction", http.StatusInternalServerError)
		tx.Rollback()
		return
	}
	tx.Commit()
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"message": "User created successfully",
		"user":    user.Username,
	}
	json.NewEncoder(w).Encode(response)
}
func HashPassword(password string, salt []byte) string {
	var passwordBytes = []byte(password)
	var sha512Hasher = sha512.New()
	passwordBytes = append(passwordBytes, salt...)
	sha512Hasher.Write(passwordBytes)
	var hashedPasswordBytes = sha512Hasher.Sum(nil)
	var hashedPasswordHex = hex.EncodeToString(hashedPasswordBytes)
	return hashedPasswordHex
}

func generateRandomSalt(saltSize int) []byte {
	var salt = make([]byte, saltSize)
	_, err := rand.Read(salt[:])
	if err != nil {
		panic(err)
	}
	return salt
}
func IsloggedIn(w http.ResponseWriter, r *http.Request, store *sessions.CookieStore, DB *sql.DB) {
	session, err := store.Get(r, "Login-session")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusUnauthorized)
		return
	}
	if session.Values["username"] == nil {
		http.Error(w, "Not logged in", http.StatusUnauthorized)
		return
	}
	var sessionID string
	err = DB.QueryRow("SELECT sessionID FROM sessions WHERE username=?", session.Values["username"]).Scan(&sessionID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Session not found", http.StatusUnauthorized)
		} else {
			http.Error(w, "Failed to query session", http.StatusInternalServerError)
		}
		return
	}
	response := map[string]string{
		"message": "Logged in",
		"user":    session.Values["username"].(string),
		"session": sessionID,
	}
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

func CheckSessions(db *sql.DB) {
	for {
		time.Sleep(15 * time.Minute)
		_, err := db.Exec("DELETE FROM sessions WHERE EndDate < NOW()")
		if err != nil {
			fmt.Println("Error deleting expired sessions:", err)
		}
	}
}
