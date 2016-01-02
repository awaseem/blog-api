# Blog API

[![Build Status](https://travis-ci.org/awaseem/blog-api.svg?branch=master)](https://travis-ci.org/awaseem/blog-api)

A simple RESTful API for a generic blog website.

## Setup

You need to set the following variables as either a config file named "config.json" in the config folder
or as environment variables:

```
...
{
    "environment": "ENVIRONMENT [prod, test, dev]",
    "database": "DATABASE_URL",
    // using different databases for testing as a temp solution, but this needs to change ASAP
    "testingDatabase": "TESTING_DATABASE_URL",
    "tokenSecret": "TOKEN_SECRET",
    "tokenExp": "TOKEN_EXP",
    "signupSecret": "SIGN_UP_SECRET"
}
...
```

After install all dependencies:
```
npm install
```
Start development environment:
```
npm run dev
```
Test changes using:
```
npm test
```
