SELECT
  user_id,
  username,
  first_name,
  last_name,
  email
FROM
  users
WHERE
  user_id = $1;
