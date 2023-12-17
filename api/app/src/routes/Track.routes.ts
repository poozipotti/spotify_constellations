import express from "express";
import * as trackController from "../controllers/track.controller";
const routes = (app: express.Application) => {
  const router = express.Router();
  const path = "/tracks";
  router.get("/:id/children", trackController.getTrackChildrenById);
  router.get("/:id", trackController.getTrackById);
  router.get("/spotify/:id", trackController.getTracksBySpotifyId);
  router.get("", trackController.getAllTracks);
  router.post("", trackController.createTrack);
  app.use(path, router);
};
export default routes;
