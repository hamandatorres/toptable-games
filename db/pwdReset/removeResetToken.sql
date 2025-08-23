UPDATE
  users
SET
  reset_token = ''
WHERE
  user_id = $1;

