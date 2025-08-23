UPDATE
  user_games
SET
  rating = $3
WHERE
  user_id = $1
  AND game_id = $2;

