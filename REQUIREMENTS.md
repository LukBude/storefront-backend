# API Requirements

The storefront API mimics the REST API of an online book store. This document specifies both the endpoints the API has to
provide, as well as the data shapes the API returns for respective GET requests.

## API Endpoints

#### Products

- Index: [GET] products/index
- Show : [GET] products/:id/show
- Create [token required, Role ADMIN]: [POST] products/create
- Top 3 most popular products: [GET] dashboard/products/popular
- Products by category (args: product category): [GET] dashboard/products?category={category}

#### Users

- Index [token required, ROLE ADMIN]: [GET] users/index
- Show [token required, ROLE ADMIN]: [GET] users/:id/show
- Create [token required, ROLE ADMIN]: [POST] users/create

#### Orders

- Current order by user (args: user id) [token required]: [GET] /orders/active
- Completed orders by user (args: user id) [token required]: [GET] /orders/complete
- Create [token required]: [POST] orders/create
- Add product [token required]: [POST] orders/:id/products
- Close [token required]: [POST] orders/:id/close

## Data Shapes

#### Product

- id
- name
- price
- category

Postgres tables:

products:

(id: INTEGER, name: VARCHAR(50), price: DECIMAL(4,2), category: VARCHAR(100))

#### User

- id
- firstname
- lastname
- username
- password

Postgres tables:

users:

(id: INTEGER, firstname: VARCHAR(50), lastname: VARCHAR(50), username: VARCHAR(50), password: VARCHAR)

#### Orders

- id
- id of each product in the order
- quantity of each product in the order
- user_id
- status of order (active or complete)

Postgres tables:

orders:

(id: INTEGER, status: VARCHAR(8), user_id: INTEGER [foreign_key to users table])

order_products:

(id: INTEGER, order_id: INTEGER [foreign key to orders table], product_id: INTEGER [foreign key to products table], quantity:
INTEGER)
