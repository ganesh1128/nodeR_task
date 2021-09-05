const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const url = "mongodb://localhost:27017";

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

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

app.listen(3000, function () {});
