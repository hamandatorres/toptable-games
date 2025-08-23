SELECT
  user_id, reset_expiration
FROM
  users
WHERE
  reset_token = $1;

