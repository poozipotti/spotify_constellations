import express from "express";
const routes = (app: express.Application) => {
  const router = express.Router();
  const path = "/login";

  router.get("/", ()=>{});

  app.use(path, router);
};
export default routes;
