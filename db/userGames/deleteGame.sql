DELETE FROM user_games
WHERE user_id = $1
  AND game_id = $2;

