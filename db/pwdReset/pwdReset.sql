UPDATE
  users
SET
  reset_token = $2,
  reset_expiration = $3
WHERE
  user_id = $1;

