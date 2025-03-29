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

	"github.com/gorilla/sessions"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// Replace with your own secret key

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
	fmt.Println(user.Username, user.Password)

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
	err = session.Save(r, w)
	if err != nil {
		http.Error(w, "Failed to save session", http.StatusInternalServerError)
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
	fmt.Println("User Created")
	json.NewEncoder(w).Encode(response)
}
