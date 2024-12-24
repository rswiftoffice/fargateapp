<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
  * [Architecture](#architecture)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Portal](#portal)
* [Usage](#usage)

<!-- ABOUT THE PROJECT -->
## About The Project

Project Description

### Built With
This repository contains backend and frontend code for RSAF Transport phase 2. Following are the technologies being used: 
* [NestJS](https://nestjs.com)
* [Prisma](https://www.prisma.io)
* [BlitzJS](https://blitzjs.com/)
* [Swagger](https://swagger.io/)
* [Material UI](https://mui.com/)
* [Postgresql 13](https://www.postgresql.org/)

### Architecture 

This project is developed using NodeJS technologies.

*Backend* of this project is written in NestJS. PostgreSQL database is used to with Prisma ORM. Prisma supports multiple databases but PostgreSQL is the best as of now and is performant. Swagger is also used to generate open api documentation.

*Frontend* is written using BlitzJS. Blitz is a framework that is built on top of NextJS. Being a NextJS framework, it offers writing backend logic as well. This means we can also make use of Prisma in BlitzJS directly for fast and secure data access.

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps below.

### Prerequisites

Before you can start running the project, below are tools that you will need to install in your development computers.

* Install the latest [NodeJS](https://nodejs.org/en/)

* Install [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#windows-stable) (optional, you can also use *npm*)
```sh
npm i -g yarn
```

### Portal

`portal` code can be found here: [RSAF TransportApp Phase 2 Portal](https://gitlab.inginim.com/team-inginim/RSAF-TransportApp-Phase2-Portal)

## Usage

* Install dependencies using:
```sh
yarn install
``` 
* Copy .env.example file content to a new file *.env* in the root directory.

* Create a new postgresql database and replace the username and password in the `DATABASE_URL` env variable of *.env* file.

* Follow [Microsoft App Registration Guide](https://aka.ms/appregistrations) to reigster a new microsoft application and copy the required tokens and replace them with env variables in .env file. 

* Update `JWT_SECRET` in *.env* file with a secure secret. _You can generate one from [here](https://mkjwk.org/)._

* After `yarn install` is finished, run the following commands.
```sh
yarn run db:migrate (if fails run "npx prisma db push")
yarn run db:generate
yarn run db:seed
```


* `db:seed` script above will create a new admin user with following credentials:
```
username: admin@example.com
password: admin123
```
That's the default credentials for super admin. You can change them before running commands above via `.env` variables (`FIRST_SUPER_ADMIN_EMAIL` & `FIRST_SUPER_ADMIN_PASSWORD`)

* Once done, you can start the backend by running:
* update src/modules/firebase/firebase.service.ts  and edit the path to firebase.config
* Change the port in ecosystem.config.js to the staging/production port
* Delete any Dist Folder before running the below command

```sh
sudo npm run-script build
yarn start
```
This will start your application at: http://localhost:8001

You can access swagger at: http://localhost:8001/api