SELECT
  game_id,
  AVG(rating) average_rating,
  SUM(play_count) play_count
FROM
  user_games
GROUP BY
  game_id;

