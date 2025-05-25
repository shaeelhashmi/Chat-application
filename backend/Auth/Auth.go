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

	utils "chat-app-backend/Utils"

	"github.com/gorilla/sessions"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
type signUpUser struct {
	Username string
	Password string
	FullName string
}

// Replace with your own secret key
func GenerateSessionID(userName string) string {
	current_time := time.Now().UnixMilli()
	sessionID := fmt.Sprintf("%x", current_time)
	sessionID = userName + sessionID
	return sessionID
}
func ComparePasswords(username string, password string, DB *sql.DB, w *http.ResponseWriter) bool {
	var dbUser User
	var dbSalt []byte
	err := DB.QueryRow("SELECT username, password, salt FROM users WHERE username=?", username).Scan(&dbUser.Username, &dbUser.Password, &dbSalt)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(*w, "Invalid username or password", http.StatusUnauthorized)
			return false
		}
		utils.HandleError(*w, err, "Failed to query user", http.StatusInternalServerError)
		return false
	}
	hashedPassword := HashPassword(password, dbSalt)
	if hashedPassword != dbUser.Password {
		http.Error(*w, "Invalid username or password", http.StatusUnauthorized)
		return false
	}
	return true
}
func Login(w http.ResponseWriter, r *http.Request, store *sessions.CookieStore, DB *sql.DB) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user User
	body, err := io.ReadAll(r.Body)
	if utils.HandleError(w, err, "Failed to read request body", http.StatusBadRequest) {
		return
	}
	err = json.Unmarshal(body, &user)
	if utils.HandleError(w, err, "Failed to unmarshal request body", http.StatusBadRequest) {
		return
	}
	defer r.Body.Close()

	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Failed to get session", http.StatusInternalServerError) {
		return
	}
	compare := ComparePasswords(user.Username, user.Password, DB, &w)
	if !compare {
		return
	}
	session.Values["username"] = user.Username
	tx, err := DB.Begin()
	if utils.HandleError(w, err, "Failed to begin transaction", http.StatusInternalServerError) {
		return
	}
	defer tx.Rollback()
	sessionID := GenerateSessionID(user.Username)

	err = session.Save(r, w)
	if utils.HandleError(w, err, "Failed to save session", http.StatusInternalServerError) {
		return
	}
	fmt.Println("Session ID:", sessionID)
	_, err = tx.Exec("INSERT INTO sessions (username, sessionID) VALUES (?, ?) ON DUPLICATE KEY UPDATE sessionID = VALUES(sessionID)", user.Username, sessionID)
	if utils.HandleError(w, err, "Failed to insert session", http.StatusInternalServerError) {
		return
	}

	err = tx.Commit()
	if utils.HandleError(w, err, "Failed to commit transaction", http.StatusInternalServerError) {
		return
	}
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

	var user signUpUser
	body, err := io.ReadAll(r.Body)
	if utils.HandleError(w, err, "Failed to read request body", http.StatusBadRequest) {
		return
	}

	err = json.Unmarshal(body, &user)
	if utils.HandleError(w, err, "Failed to unmarshal request body", http.StatusBadRequest) {
		return
	}
	if utils.HandleError(w, err, "Failed to unmarshal request body", http.StatusBadRequest) {
		return
	}
	if user.Username == "" || user.Password == "" {
		http.Error(w, "Username and password are required", http.StatusBadRequest)
		return
	}
	if len(user.Username) < 3 {
		http.Error(w, "Username must be at least 3 characters long", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	tx, err := DB.Begin()
	if utils.HandleError(w, err, "Failed to begin transaction", http.StatusInternalServerError) {
		return
	}
	defer tx.Rollback()

	var exists bool
	err = DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username=?)", user.Username).Scan(&exists)
	if utils.HandleError(w, err, "Failed to check if user exists", http.StatusInternalServerError) {
		return
	}
	if exists {
		http.Error(w, "Username already exists", http.StatusConflict)
		return
	}
	salt := GenerateRandomSalt(16)
	hashedPassword := HashPassword(user.Password, salt)
	_, err = tx.Exec("INSERT INTO users (username, password, salt,fullName) VALUES (?, ?, ?,?)", user.Username, hashedPassword, salt, user.FullName)
	if utils.HandleError(w, err, "Failed to insert user", http.StatusInternalServerError) {
		return
	}
	if err := tx.Commit(); utils.HandleError(w, err, "Failed to commit transaction", http.StatusInternalServerError) {
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

func GenerateRandomSalt(saltSize int) []byte {
	var salt = make([]byte, saltSize)
	_, err := rand.Read(salt[:])
	if err != nil {
		panic(err)
	}
	return salt
}
func IsloggedIn(w http.ResponseWriter, r *http.Request, store *sessions.CookieStore, DB *sql.DB) {
	session, err := store.Get(r, "Login-session")
	if utils.HandleError(w, err, "Failed to get session", http.StatusInternalServerError) {
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
	if utils.HandleError(w, err, "Failed to get session", http.StatusInternalServerError) {
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
