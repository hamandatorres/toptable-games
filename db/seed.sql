DROP TABLE user_games;

DROP TABLE users;

CREATE TABLE users (
  user_id serial PRIMARY KEY,
  username text,
  first_name text,
  last_name text,
  hash text,
  email text,
  reset_token text,
  reset_expiration date
);

CREATE TABLE user_games (
  id serial PRIMARY KEY,
  user_id int REFERENCES users (user_id),
  game_id text,
  play_count int,
  rating int,
  review text
);

-- Test Data
INSERT INTO users (first_name, last_name, email, username)
  VALUES ('a', 'a', 'a', 'User A'), ('b', 'b', 'b', 'User B'), ('c', 'c', 'c', 'User C'), ('d', 'd', 'd', 'User D');

INSERT INTO user_games (game_id, user_id, play_count, rating, review)
  VALUES ('0Z20rVZ9GQ', 1, 10, 2, 'Test review 1'), ('kM98P8Iplw', 1, 1, 3, 'Test review 2'), ('0Z20rVZ9GQ', 1, 4, 4, 'Test review 3'), ('0Z20rVZ9GQ', 2, 8, 5, 'Test review 4'), ('kM98P8Iplw', 2, 9, 4, 'Test review 5'), ('0Z20rVZ9GQ', 2, 20, 3, 'Test review 6'), ('kM98P8Iplw', 3, 21, 2, 'Test review 7'), ('kM98P8Iplw', 3, 13, 1, 'Test review 8'), ('0Z20rVZ9GQ', 3, 5, 4, 'Test review 9'), ('2lIAkSns4o', 3, 9, 5, 'Test review 10'), ('0Z20rVZ9GQ', 4, 20, 2, 'Test review 11'), ('kM98P8Iplw', 4, 15, 4, 'Test review 12'), ('0Z20rVZ9GQ', 4, 25, 3, 'Test review 13'), ('2lIAkSns4o', 4, 23, 2, 'Test review 14');

