const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const MongoClient = require("mongodb").MongoClient;
const url =
  "mongodb+srv://RWUser:h6SmYQJKhA539tbG@mernproject.jqcxaqy.mongodb.net/?appName=MernProject";
const client = new MongoClient(url);

app.use(express.json()); 

client.connect().then(() => {
  console.log("MongoDB connected");
}).catch(err => console.error(err));

var taskList = [];
var cEventList = [];
var documentsList = [];
var groupList = [];

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  next();
});

app.post("/api/addTask", async (req, res, next) => {
  // incoming: userId, task, deadline
  // outgoing: error
  const { userId, task, deadline } = req.body;
  const newTask = { Task: task, Deadline: deadline, UserId: userId };
  var error = "";
  try {
    const db = client.db("Users");
    const result = await db.collection("Tasks").insertOne(newTask);
  } catch (e) {
    error = e.toString();
  }
  taskList.push(task);
  var ret = { error: error };
  res.status(200).json(ret);
});

app.post("/api/addCEvent", async (req, res, next) => {
  // incoming: userId, title, description, time
  // outgoing: error
  const { userId, title, description, time, date } = req.body;
  const newEvent = {
    UserId: userId,
    Title: title,
    Description: description,
    Time: time,
    Date: date,
  };
  var error = "";
  try {
    const db = client.db("Users");
    const result = await db.collection("CEvents").insertOne(newEvent);
  } catch (e) {
    error = e.toString();
  }
  cEventList.push(title);
  var ret = { error: error };
  res.status(200).json(ret);
});

app.post("/api/addDocument", async (req, res, next) => {
  // incoming: userId, title, contents
  // outgoing: error
  const { userId, title, contents } = req.body;
  const newDocument = { UserId: userId, Title: title, Contents: contents };
  var error = "";
  try {
    const db = client.db("Users");
    const result = await db.collection("Documents").insertOne(newDocument); 
  } catch (e) {
    error = e.toString();
  }
  documentsList.push(title);
  var ret = { error: error };
  res.status(200).json(ret);
});

app.post("/api/updateGroup", async (req, res, next) => {
  // incoming: userId, group
  // outgoing: error
  const { userId, group } = req.body;
  const user = { UserID: userId }; 
  const newGroup = { $set: { Group: group } };
  var error = "";
  try {
    const db = client.db("Users");
    const result = await db.collection("Accounts").updateOne(user, newGroup);
  } catch (e) {
    error = e.toString();
  }
  groupList.push(group);
  var ret = { error: error };
  res.status(200).json(ret);
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const db = client.db("Users");

    
    const user = await db.collection("Accounts").findOne({ Email: email });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user.UserID },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.post("/api/signup", async (req, res, next) => {
  // incoming: name, email, password
  // outgoing: token, error

  const { name, email, password } = req.body;

  var error = "";
  var token = "";

  try {
    const db = client.db("Users");

    const existing = await db
      .collection("Accounts")
      .find({ Email: email })
      .toArray();

    if (existing.length > 0) {
      error = "User already exists";
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        UserID: Math.floor(Math.random() * 1000000),
        Email: email,
         Password: hashedPassword,
        FirstName: name,
        LastName: ""
      };

      await db.collection("Accounts").insertOne(newUser);

      token = jwt.sign(
        { email: email },
        "secretkey",
        { expiresIn: "1h" }
      );
    }
  } catch (e) {
    error = e.toString();
  }

  var ret = { token: token, error: error };
  res.status(200).json(ret);
});

app.post("/api/searchTasks", async (req, res, next) => {
  // incoming: userId, search
  // outgoing: results[], error
  var error = "";
  const { userId, search } = req.body;
  var _search = search.trim();
  const db = client.db("Users");
  const results = await db
    .collection("Tasks")
    .find({ Task: { $regex: _search + ".*", $options: "i" } })
    .toArray();
  var _ret = [];
  for (var i = 0; i < results.length; i++) {
    _ret.push(results[i].Task);
  }
  var ret = { results: _ret, error: error };
  res.status(200).json(ret);
});

app.get("/api/ping", (req, res, next) => {
  res.status(200).json({ message: "Hello World" });
});

app.listen(5000); // start Node + Express server on port 5000