UPDATE
  user_games
SET
  play_count = play_count - 1
WHERE
  user_id = $1
  AND game_id = $2
RETURNING play_count; 