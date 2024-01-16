# Spotify Constellations 🌠

## What is it?

This project was started to see if I could find an interesting way to explore the spotify api. I found spotify jam feature really intriguing, especially 
the push and pull of different peoples tastes colliding. If someone changed the entire vibe, would it stick, or not?

To capture this feeling spotify constellations uses a database to store a directed graph of connections between different tracks. Each track only exists once in the system,
when a user adds a new song it is either added directly if it hasn't been added before, or a new association is made if it already exists. Right now there are very few constraints 
on exactly how these connections are made, but the plan is to eventually add a combination of sensible rules (i.e. right now it is possible to have a track lookup to istelf) and metadata to allow
the system to priotize popular connections or use some other metric to allow for easier navigation. 

The system synchonizes the choices the choices the user makes while traversing the constellation graph by manipulating a playlist saved on the user's spotify account. This became neccesary because directly trying to 
add new songs to the spotify player as previous songs was very slow and felt stilted. It also has the benefit of allowing users to save their progress and return to it later. 


> Spotify Constellations is still in an unfinished state and does not have a player
> implemented yet. To be able to start Constellations make sure to have spotify running in the background
> start playing a song.


## Spotify Setup instructions

This app requires you to setup an app an have a spotify client id [Instructions can be found here](https://developer.spotify.com/documentation/web-api/tutorials/getting-started)

## How to run locally

clone this repo:

```bash
git clone https://github.com/poozipotti/spotify_constellations.git

```

### Api

- Use `cd <path-to-repo>/spotify_web/client`
  to navigate to the react app folder

- Copy the contents of example.env to .env before running any commands

docker is required to run:

```bash
docker compose up --build
```

### Client

Copy the contents of example.env to .env before running any commands, and add your spotify client id
yarn is required to run.

- Use `cd <path-to-repo>/spotify_web/api`
  to navigate to the server folder

- First install the node_modules.

```bash
yarn
```

- Next, run the development server


```bash
yarn dev
```

The website should be live at `localhost:3000`


## Thank you Bezkoder

The api for this app wasbased off of designs from [Bezkoder](https://www.bezkoder.com)
from these articles specifically

> [Dockerize Node.js Express and MySQL example - Docker Compose](https://www.bezkoder.com/docker-compose-nodejs-mysql/)
> [Build Node.js Rest APIs with Express & MySQL](https://www.bezkoder.com/node-js-rest-api-express-mysql/)

The main system changes I made are as follows

- migrate to typescript and use sequilize-typescript as the main driver

- use postgres instead of MySQL (I am just more familiar with it, no technical reason)
