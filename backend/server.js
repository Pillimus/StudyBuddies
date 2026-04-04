const express = require("express");
const app = express();

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

app.post("/api/login", async (req, res, next) => {
  // incoming: login, password
  // outgoing: id, firstName, lastName, error
  var error = "";

  const { email, password } = req.body; 

  const db = client.db("Users");
  const results = await db
    .collection("Accounts")
    .find({ Email: email, Password: password }) 
    .toArray();

  var id = -1;
  var fn = "";
  var ln = "";
  if (results.length > 0) {
    id = results[0].UserID;
    fn = results[0].FirstName;
    ln = results[0].LastName;
  } else {
    error = "Invalid login"; 
  }

  var ret = { id: id, firstName: fn, lastName: ln, error: error };
  res.status(200).json(ret);
});
app.post("/api/signup", async (req, res, next) => {
  // incoming: name, email, password
  // outgoing: error

  const { name, email, password } = req.body;

  var error = "";

  try {
    const db = client.db("Users");

    const existing = await db
      .collection("Accounts")
      .find({ Email: email })
      .toArray();

    if (existing.length > 0) {
      error = "User already exists";
    } else {
      const newUser = {
        UserID: Math.floor(Math.random() * 1000000),
        Email: email,
        Password: password,
        FirstName: name,
        LastName: ""
      };

      await db.collection("Accounts").insertOne(newUser);
    }
  } catch (e) {
    error = e.toString();
  }

  var ret = { error: error };
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
