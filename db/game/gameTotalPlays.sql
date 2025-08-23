SELECT
  SUM(play_count)
FROM
  user_games
WHERE
  game_id = $1;

