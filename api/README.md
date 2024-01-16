# Docker Compose Nodejs and MySQL example

## Thank you Bezkoder

This app was built with from based off of designs from [Bezkoder](https://www.bezkoder.com)
from these articles specifically

For more detail, please visit:
> [Dockerize Node.js Express and MySQL example - Docker Compose](https://www.bezkoder.com/docker-compose-nodejs-mysql/)

Related Posts:
> [Build Node.js Rest APIs with Express & MySQL](https://www.bezkoder.com/node-js-rest-api-express-mysql/)

The main system changes I made are as follows

- migrate to typescript and use sequilize-typescript as the main driver

- use postgres instead of MySQL (I am just more familiar with it, no technical reason)


## Run the System
Copy the contents of example.env to .env before running any commands

docker is required to run:

```bash
docker compose up --build
```



