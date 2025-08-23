SELECT
  u.user_id,
  u.username,
  ug.game_id,
  ug.play_count,
  ug.rating,
  ug.review
FROM
  user_games ug
  JOIN users u ON u.user_id = ug.user_id
WHERE
  ug.game_id = $1;

