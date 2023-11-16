import express from "express";
import * as LoginController from "../controllers/login.controller";
const routes = (app: express.Application) => {
  const router = express.Router();
  const path = "/login";

  router.get("/", LoginController.spotifyLoginRequest);

  app.use(path, router);
};
export default routes;
