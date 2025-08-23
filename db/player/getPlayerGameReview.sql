SELECT review FROM user_games
WHERE user_id = $1 and game_id =$2;