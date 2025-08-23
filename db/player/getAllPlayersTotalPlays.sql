SELECT
  temp.username,
  SUM(play_count) total
FROM (
  SELECT
    u.user_id user_id,
    u.username username,
    ug.play_count play_count
  FROM
    user_games ug
    JOIN users u ON u.user_id = ug.user_id
    WHERE play_count NOTNULL) temp
GROUP BY
  username
ORDER BY
  total DESC
LIMIT 5;