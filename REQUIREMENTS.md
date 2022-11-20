# API Requirements

The company stakeholders want to create an online storefront to showcase their great product ideas. Users need to be able to
browse an index of all products, see the specifics of a single product, and add products to an order that they can view in a cart
page. You have been tasked with building the API that will support this application, and your coworker is building the frontend.

These are the notes from a meeting with the frontend developer that describe what endpoints the API needs to supply, as well as
data shapes the frontend and backend have agreed meet the requirements of the application.

## API Endpoints

#### Products

- Index: [GET] products/index
- Show : [GET] products/show/:id
- Create [token required]: [POST] products/create
- Top 5 most popular products: [GET] dashboard/products/popular
- Products by category (args: product category): [GET] dashboard/products/category

#### Users

- Index [token required]: [GET] users/index
- Show [token required]: [GET] users/show/:id
- Create [token required]: [POST] users/create

#### Orders

- Current order by user (args: user id) [token required]: [GET] /orders/active
- Completed orders by user (args: user id) [token required]: [GET] /orders/complete
- Create [token required]: [POST] orders/create

## Data Shapes

#### Product

- id
- name
- price
- category

Postgres tables:

products:

(id: INTEGER, name: VARCHAR(50), price: DECIMAL(4,2), category: VARCHAR(50))

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