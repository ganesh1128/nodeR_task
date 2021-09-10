const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const bcryptjs = require("bcryptjs");
// const url = "mongodb+srv://ganesh:admin123@cluster0.ahz4h.mongodb.net?retryWrites=true&w=majority";
const url = "mongodb://localhost:27017";
const PORT = process.env.PORT || 3000

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());


app.post("/register",async function(req,res){
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
      res.json({
        message : true
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


app.get("/list-all-todo", async function (req, res) {
  try {
    //Connect the database
    let client = await mongoClient.connect(url);

    //select the DB
    let db = client.db("todo_app");

    //select the collection and perform the action
    let data = await db.collection("tasks").find({}).toArray();

    //close the connection
    client.close();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

app.post("/create-task", async function (req, res) {
  try {
    //Connect the database
    let client = await mongoClient.connect(url);

    //select the DB
    let db = client.db("todo_app");

    //select the collection and perform the action
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

app.put("/update-task/:id", async function (req, res) {
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

app.delete("/delete-task/:id", async function (req, res) {
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

app.listen(PORT, function () {});
console.log(`listeniong to ${PORT}`);



