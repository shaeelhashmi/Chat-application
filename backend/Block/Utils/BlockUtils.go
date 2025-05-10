package blockutils

import (
	"database/sql"
	"fmt"
)

func Blocked(db *sql.DB, userID int, coloumn string) ([]int, error) {
	var dataColoumn string
	if coloumn == "blocked_by" {
		dataColoumn = "blocked"
	} else if coloumn == "blocked" {
		dataColoumn = "blocked_by"
	}

	query := fmt.Sprintf("SELECT %s FROM blocked_users WHERE %s = ?", dataColoumn, coloumn)
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var blockedUsers []int
	for rows.Next() {
		var username int
		if err := rows.Scan(&username); err != nil {
			return nil, err
		}
		blockedUsers = append(blockedUsers, username)
	}
	fmt.Println("Blocked users:", blockedUsers, userID)
	return blockedUsers, nil
}
