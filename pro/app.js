const express = require("express");
const cors = require("cors");
const User = require("./model/user.model");
const app = express();
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

require("./config/database");
require("dotenv").config();
app.get("/", (req,res)=>{
    res.send("something");
});


//register route
app.post("/register",async(req,res)=>{
  try {
    const user = await User.findOne({username:req.body.username});
    if(user){
     return res.send("user already exists")
    }
 
    bcrypt.hash(req.body.password,saltRounds,async(err,hash)=>{
     const newUser = new User({
         username:req.body.username,
         password:hash
     });
     await newUser.save()
     .then((user)=>{
         res.send({
             success:true,
             message:"user is create successfully",
             user:{
                 id:user._id,
                 username:user.username
             }
 
         })
     }).catch((error)=>{
         res.send({
             success:false,
             message:"user not create",
             error:error
         })
     })
  })
  } catch (error) {
    res.status(500).send(error.message);
  }
})

//login route
app.post("/login",async(req,res)=>{
   const user = await User.findOne({username:req.body.username});
   if(!user){
    return res.status(500).send({
        success:false,
        message:"User is not founds"
    })
   }
   if(!bcrypt.compareSync(req.body.password,user.password)){
    return res.status(500).send({
        success:false,
        message:"Invalid password",
    })
   }

   const payload = {
    id:user._id,
    username:user.username
   };

   const token = jwt.sign(payload,process.env.SECRET_KEY,{
    expiresIn:"2d"
   })
   return res.status(200).send({
    success:true,
    message:"User is logged in successfully",
    token:"Bearer "+token,
   })
})

 //verify token 
function verifyToken(req,res,next){
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== "undefined"){
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
    } else{
       res.sendStatus(403)
    }
 }


//profile route
app.get("/profile", verifyToken, (req,res)=>{
    jwt.verify(req.token,process.env.SECRET_KEY,(err,authData)=>{
        if(err){
           res.sendStatus(403);
        } else{
          res.json({
              message:"post create...",
              success:true,
              authData
          })
        }
    })
      
})


app.use((req,res,next) =>{
    res.send("route not found")
    
})

app.use((err,req,res,next) =>{
    res.send("something broken")
    
})


module.exports = app;