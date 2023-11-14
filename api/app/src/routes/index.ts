import express from "express";
export const connectRoutes = (app:express.Application) => {
 app.get('/test', (req,res)=>{
   return res.json({message: 'api test success'})
 })
}
