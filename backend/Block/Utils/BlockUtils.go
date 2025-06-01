package blockutils

import (
	"database/sql"
	"fmt"
	"time"
)

func Blocked(db *sql.DB, userID int, coloumn string) ([]int, []int, []string, error) {
	var dataColoumn string
	if coloumn == "blocked_by" {
		dataColoumn = "blocked"
	} else if coloumn == "blocked" {
		dataColoumn = "blocked_by"
	}

	query := fmt.Sprintf("SELECT id,%s,created_at FROM blocked_users WHERE %s = ?", dataColoumn, coloumn)
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, nil, nil, err
	}
	defer rows.Close()

	var blockedUsers []int
	var blockedID []int
	var createdAt []string
	for rows.Next() {
		var username int
		var id int
		var Time string
		if err := rows.Scan(&id, &username, &Time); err != nil {
			return nil, nil, nil, err
		}
		parsedTime, err := time.Parse("2006-01-02 15:04:05", Time)
		if err != nil {
			return nil, nil, nil, err
		}
		createdAt = append(createdAt, parsedTime.Format("2006-01-02 15:04:05"))
		blockedUsers = append(blockedUsers, username)
		blockedID = append(blockedID, id)
	}
	return blockedUsers, blockedID, createdAt, nil
}
