import express from "express";
import loginRoutes from "./Login.routes";
export const connectRoutes = (app: express.Application) => {
  app.get("/test", (req, res) => {
    return res.json({ message: "api test success" });
  });
  loginRoutes(app);
};
