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

## How to run locally

clone this repo:

```bash
git clone https://github.com/poozipotti/spotify_web.git

```

### Client
> This app consists of an express server and a react app which acts as a client to consume data from the server. To run the app locally,
> the server must be started and running before the client can start or it will fail.

- Use `cd <path-to-repo>/spotify_web/api`
  to navigate to the server folder

- Open the [/api Readme](./api/README.md) and follow the instructions found there to start the server

### Api

- Use `cd <path-to-repo>/spotify_web/client`
  to navigate to the react app folder

- Open the [/client Readme](./client/README.md) and follow the instructions found there to start the react app
