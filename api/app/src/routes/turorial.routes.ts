export const app = (app) => {

  var router = require("express").Router();

  // Delete all Tutorials
  router.get("/test", (req,res) => {
    res.status(200).send({
      message: "api running"
    });
    return;
  });
  app.use('/api', router);
};
