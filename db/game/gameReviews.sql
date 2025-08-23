SELECT
  u.username,
  ug.rating,
  ug.review
FROM
  user_games ug
  JOIN users u ON u.user_id = ug.user_id
WHERE
  game_id = $1;

