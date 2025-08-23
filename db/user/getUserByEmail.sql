SELECT
  user_id,
  username,
  first_name,
  last_name,
  email
FROM
  users
WHERE
  email = $1;