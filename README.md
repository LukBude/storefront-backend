# storefront-backend

This project implements a REST API, which mimics the REST API of an online book store. The requirements the API has to fulfill
are specified inside the REQUIREMENTS.md.

## Setup the PostgreSQL database

The storefront API relies on the interaction with a local PostgreSQL database. In order to test the API, you will first have to
set up the database, which provides the actual data. To do so, you need to have docker installed.

1. Clone this repository, navigate into it and open a console.
2. In the next step, navigate into the docker folder and run the command
   "docker-compose up". \
   &#8594; This command will create two docker containers, which run a PostgreSQL database each. Open the
   docker-compose.yml for more information about the databases, such as the respective database name and the username and password
   combination required
   to connect to it. Notice that only one of the databases holds the data, which the storefront API works with. The other database
   exists for test purposes only.
3. You will now have to create a .env file inside the root folder of the storefront-backend repository. This file contains
   important
   information about both the database and encryption. Make sure to include the following entries inside the .env file: \
   \
   POSTGRES_HOST=127.0.0.1 \
   POSTGRES_PORT=32775 \
   POSTGRES_PORT_TEST=32776 \
   POSTGRES_DB=storefront_db \
   POSTGRES_DB_TEST=storefront_db_test \
   POSTGRES_USER=dev_user \
   POSTGRES_PASSWORD=secret \
   ENV=dev \
   BCRYPT_PASSWORD='think of a password added as 'pepper' to each user's password' \
   SALT_ROUNDS=10 \
   TOKEN_SECRET='think of a password used to encrypt your JWT token' \
   \
   The information about the database has to be consistent with the information provided inside the docker-compose.yml.
   Feel free to use different database names or username and password combinations.

4. Once you are done, open a console inside the root folder of the storefront-backend repository and execute the command "db-migrate up".
   This will create the necessary database tables inside the PostgreSQL database.

## Testing the REST API

Once the database is up and running, you can go ahead and test the REST API. For this purpose, you need to have nodJs installed.

1. Navigate into the storefront-backend repository once again and open a console.
   This repository contains a package.json, which includes several node scripts.
   In order to test the REST API, run the node script "serve" by executing the command "npm run serve" inside your console.
   This command will start an express server on port 3000 of your localhost.
2. The different endpoints provided by the storefront API can be tested using Postman or any other HttpClient, often already
   integrated in an IDE. To make testing the storefront API a little bit easier, I have created the storefront-api-requests.http
   file, which allows for executing HTTP-requests, for example by using IntelliJ's HttpClient. Execute the Http-requests from top
   to bottom. Some of the endpoints require authentication and some require authorization on top of this. In order to be able to
   test
   requests, which require authorization, you will first have to create a user - this is the first request inside the
   storefront-api-requests.http - and in a second step add an entry to the table roles, which assigns the role 'ADMIN' to the new
   user.
   You can now execute the Http-requests one after the other, just be sure to provide the JWT token required for authentication
   wherever
   indicated in the storefront-api-request.http file.

## Run Jasmine Tests

The different store models as well as the dashboard service have been tested using Jasmine.
In order to execute these tests, open a console inside the root folder of the
storefront-backend repository and execute the command "npm run test". 
