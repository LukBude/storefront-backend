CREATE TABLE products
(
    id       SERIAL PRIMARY KEY,
    name     VARCHAR(50),
    price    DECIMAL(4, 2),
    category VARCHAR(50)
);