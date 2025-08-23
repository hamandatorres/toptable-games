SELECT
  game_id,
  review
FROM
  user_games
WHERE
  user_id = $1;

