require('dotenv').config();
const app=require("./app")
const http =require("http"); 
const server=http.createServer(app)
server.listen(process.env.PORT);