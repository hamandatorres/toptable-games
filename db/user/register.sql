INSERT INTO users (email, username, first_name, last_name, hash)
  VALUES ($1, $2, $3, $4, $5)
RETURNING
  user_id;

