SELECT
  game_id,
  AVG(rating) average_rating
FROM
  user_games
GROUP BY
  game_id;

