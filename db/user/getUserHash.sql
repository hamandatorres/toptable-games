SELECT
  hash
FROM
  users
WHERE
  email = $1
  OR username = $1;

