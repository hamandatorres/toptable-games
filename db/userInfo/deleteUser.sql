DELETE FROM user_games
WHERE user_id = $1;

DELETE FROM users
WHERE user_id = $1;

