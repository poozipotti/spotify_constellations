import express from "express";
import * as trackController from "../controllers/track.controller";
const routes = (app: express.Application) => {
  const router = express.Router();
  const path = "/tracks";
  router.get("/:id/children", trackController.getTrackChildrenById);
  router.get("/:id/parents", trackController.getTrackParentsById);
  router.get("/:id", trackController.getTrackById);
  router.get("/spotify/:spotifyId", trackController.getTracksBySpotifyId);
  router.get("", trackController.getAllTracks);
  router.post("", trackController.createTracks);
  app.use(path, router);
};
export default routes;
