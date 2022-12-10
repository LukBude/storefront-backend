# storefront-backend

This project implements a REST API, which mimics the REST API of an online book store. The requirements the API has to fulfill
are specified inside the REQUIREMENTS.md.

## Setup the PostgreSQL database

The storefront API relies on the interaction with a local PostgreSQL database. In order to test the API, you will first have to
set up the database, which provides the actual data. To do so, you need to have docker installed.

1. Clone this repository, navigate into it and open a console.
2. In the next step, navigate into the docker folder and run the command
   "docker-compose up". \
   &#8594; This command will create two docker containers, which run a PostgreSQL database each. One of the docker containers runs
   a database, which holds the data the storefront API works with, and is exposing port 32775. The other docker container runs a
   database for test purposes only and is exposing port 32776. Open the docker-compose.yml for more information about the
   databases,
   such as the respective database name and the username and password combination required to connect to it.
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
   Feel free to use different database names or username and password combinations. Notice that changing this
   information will affect the database.json file, located in the root folder of the storefront-backend repository, as
   well.
   The database.json file contains information required by db-migrate, a node package used for database migration, as will be
   explained in the next step.

4. Once you are done, you are ready to create the necessary database tables inside the PostgreSQL database. In order to do so,
   you need to have nodeJs installed. Open a console and navigate to the root folder of the storefront-backend repository. Install
   all required node dependencies by executing the command "npm install". Finally, execute "db-migrate up".

## Testing the REST API

Once the database is up and running, you can go ahead and test the REST API.

1. Navigate into the storefront-backend repository once again and open a console.
   This repository contains a package.json, which includes several node scripts.
   In order to test the REST API, run the node script "serve" by executing the command "npm run serve" inside your console.
   This command will start an express server on port 3000 of your localhost.
2. The different endpoints provided by the storefront API can be tested using Postman or any other HttpClient, often already
   integrated in an IDE. To make testing the storefront API a little bit easier, I have created the storefront-api-requests.http
   file, which allows for executing HTTP-requests, for example by using the HttpClient of the IDE <em>IntelliJ</em>.
   Execute the Http-requests from top to bottom. Some of the endpoints require authentication and some require authorization
   on top of this. When you execute the Http-requests, be sure to provide the correct JWT required for authentication and
   authorization wherever indicated in the storefront-api-request.http file.

## Run Jasmine Tests

The different store models as well as the dashboard service have been tested via unit tests by making use of jasmine. Since the
methods being tested are interacting with a database, the tests are configured to work with a test-database.
The endpoints have been tested by making use of jasmine in combination with the node module supertest. In order to execute these
tests, open a console inside the root folder of the storefront-backend repository and execute the command "npm run test". 
