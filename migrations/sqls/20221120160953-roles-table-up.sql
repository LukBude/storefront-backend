CREATE TABLE roles
(
    id      SERIAL PRIMARY KEY,
    role    VARCHAR(5),
    user_id INTEGER REFERENCES users (id)
);