CREATE TABLE orders
(
    id      SERIAL PRIMARY KEY,
    status  VARCHAR(8),
    user_id INTEGER REFERENCES users (id)
);