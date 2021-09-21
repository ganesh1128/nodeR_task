const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv =require("dotenv")
dotenv.config();
// console.log(process.env);
// const url = "mongodb+srv://ganesh:admin123@cluster0.ahz4h.mongodb.net?retryWrites=true&w=majority";
const url = process.env.DB;
const PORT = process.env.PORT || 3000

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

function authenticate(req,res,next){
 try {
  console.log(req.headers.authorization)
  //check the token is present
  //if present check if it is valid
  if(req.headers.authorization){
     jwt.verify(req.headers.authorization,process.env.JWT_SECRET,function(error,decoded){
       if(error){
        res.status(500).json({
          message:"Unauthorized"
        })
       }else{
         console.log(decoded)
         req.userid = decoded.id;
         next()
       }
     });
    }else{
      res.status(401).json({
        message:"token is not present"
      })

    }
 } catch (error) {
   console.log(error);
   res.status(500).json({
    message:"internal server error"
  })
 }
  
}


app.post("/register*",async function(req,res){
try {
    //Connect the database
    let client = await mongoClient.connect(url);
  
    //select the DB
    let db = client.db("todo_app");
    //Hash the Password
    let salt = bcryptjs.genSaltSync(10);
    let hash = bcryptjs.hashSync(req.body.password,salt)
    req.body.password = hash;
  
    //select the collection and perform the action
    
    let data = await db.collection("users").insertOne(req.body);
     //close the connection
     await client.close();
     res.json({
       message: "User Registered",
       id : data._id
     })
  
} catch (error) {
  res.status(500).json({
    message: "Something went wrong",
  });
}
});


app.post("/login", async function(req,res){
  try {
    //Connect the database
    let client = await mongoClient.connect(url);
  
    //select the DB
    let db = client.db("todo_app");

    //find the user with email_id
    let user = await db.collection("users").findOne({username : req.body.username});
    if(user){
      //hash the incoming password
    //compare that with users password
    let matchPassword = bcryptjs.compareSync(req.body.password,user.password)
    if(matchPassword){
      //generate jwt token
      let token = jwt.sign({id:user._id},process.env.JWT_SECRET)
      
      console.log(token)
      res.json({
        message : true,
        token
      })
    }else{
      res.status(404).json({
        message :  "username/password not found"
      })
    }
    //if both are correct allow them
    }else{
      res.status(404).json({
        message : "username/password not found"
      })
    }
  } catch (error) {
    console.log(error);
  }
});


let tasks = [];


app.get("/list-all-todo",[authenticate], async function (req, res) {
  try {
    //Connect the database
    let client = await mongoClient.connect(url);

    //select the DB
    let db = client.db("todo_app");

    //select the collection and perform the action
    let data = await db.collection("tasks").find({userid : req.userid}).toArray();

    //close the connection
    client.close();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.post("/create-task", [authenticate],async function (req, res) {
  try {
    //Connect the database
    let client = await mongoClient.connect(url);

    //select the DB
    let db = client.db("todo_app");

    //select the collection and perform the action
    req.body.userid=req.userid;
    let data = await db.collection("tasks").insertOne(req.body);

    //close the connection
    await client.close();
    res.json({
      message: "Task Created",
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.put("/update-task/:id",[authenticate], async function (req, res) {
    try {
        //Connect the database
    let client = await mongoClient.connect(url);

    //select the DB
    let db = client.db("todo_app");

    //select the collection and perform the action
    let data = await db.collection("tasks")
               .findOneAndUpdate({_id : mongodb.ObjectId(req.params.id)},{$set : req.body})
     //close the connection
     await client.close();
     res.json({
        message: "Task Updated",
      });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
          });
        
    }
  
});

app.delete("/delete-task/:id",[authenticate], async function (req, res) {
    try {
        //Connect the database
    let client = await mongoClient.connect(url);

    //select the DB
    let db = client.db("todo_app");

    //select the collection and perform the action
    let data = await db.collection("tasks")
               .findOneAndDelete({_id : mongodb.ObjectId(req.params.id)})
     //close the connection
     await client.close();
     res.json({
        message: "Task Deleted",
      });

    } catch (error) {
        res.status(500).json({
            message: "Something went wrong",
          });
        
    }
});

app.get("/dashboard",[authenticate], async (req,res) => {
  res.json({
    message:"Protected data"
  })

})



app.listen(PORT, function () {});
console.log(`listeniong to ${PORT}`);



