SELECT
  SUM(play_count)
FROM
  user_games
WHERE
  user_id = $1;

