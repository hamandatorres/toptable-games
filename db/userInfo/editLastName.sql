UPDATE
  users
SET
  last_name = $2
WHERE
  user_id = $1;

