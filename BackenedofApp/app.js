const express=require("express"); 
var cors=require("cors")
const app=express(); 
require("dotenv").config();
const connection=require('./connection');
app.use(express.json()); 
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const JWT_TOKEN='a5e4a119fce600bf8b4dd043e42eb408a5a224e4be64152befe89aa342bd92474ba7f2b7179c156f2c16fe9229a848aea6fb63af99423af08259773f07929c7c';
app.use(cors({
  origin: 'http://localhost:8081'
}));
app.get("/",(req,res)=>{
  res.send({status:"Started"})

})
app.post("/register", async (req, res) => {
    let user = req.body;
    const encryptedPassword=await bcrypt.hash(user.Password,10)
  
    console.log(user, "user Data",encryptedPassword);
    query = "select name,phone,email,password from applicationUsers where email=?";
    connection.query(query, [user.email], (err, results) => {
      if (!err) {
        if (results.length <= 0) {
          query =
            "insert into applicationUsers(name,phone,email,password) values(?,?,?,?)";
          connection.query(
            query,
            [user.name, user.phone, user.email, encryptedPassword],
            (err, results) => {
              if (!err) {
                return res
                  .status(200)
                  .json({ message: "Successfully Registered" });
              } else {
                return res.status(500).json(err);
              }
            }
          );
        } else {
          return res.status(400).json({ message: "Email ALready Exist" });
        }
      } else {
        res.status(500).json(err);
      }
    });
  });

  app.post("/login-user", (req, res) => {
    const user = req.body;
    console.log(user, "user");
    query = "select email,password,name,phone from applicationUsers where email=?";
    connection.query(query, [user.email], async (err, result) => {
      if (!err) {
        if (result.length <= 0 ) {
          console.log("User Not Exist")
         return res.status(401).json({ message: "User Not Exist" });
        }else if (await bcrypt.compare(user.Password,result[0].password)) {
          const accessToken = jwt.sign({email:result[0].email}, JWT_TOKEN, {
            expiresIn: "8h",
          });
          if(res.status(200)){
            return res.status(200).json({ token: accessToken,message:"Successfully Login" });
          }
          
        } else {
          return res
            .status(400)
            .json({ message: "Please use right password" });
        }
      } else {
        return res.status(500).json(err);
      }
    });
  });
  app.post("/user-data",(req,res)=>{

  
  const {token}=req.body; 
  console.log(req.body)
  const user=jwt.verify(token,JWT_TOKEN);
  const userEmail=user.email;
  console.log(userEmail,'email')
  const query="select * from applicationUsers where email =?";
  connection.query(query, [userEmail], (err, results) => {
   
      console.log(results,"result" ,results.length)
      if (results.length != 0) {
        console.log(results)
        return res.send({data:results[0]})
      }
    
  })


  })
app.use(cors()); 
app.use(express.urlencoded({extended:true})); 
module.exports=app;