import express from "express";
import trackRoutes from "./Track.routes";
export const connectRoutes = (app: express.Application) => {
  app.get("/test", (req, res) => {
    return res.json({ message: "api test success" });
  });
  trackRoutes(app);
};
