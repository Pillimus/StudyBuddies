const MongoClient = require("mongodb").MongoClient;
const url =
  "mongodb+srv://<db_username>:<db_password>@mernproject.jqcxaqy.mongodb.net/?appName=MernProject";
const client = new MongoClient(url);
client.connect();

app.post("/api/addTask", async (req, res, next) => {
  // incoming: userId, task, deadline
  // outgoing: error
  const { userId, task, deadline } = req.body;
  const newTask = { Task: task, Deadline: deadline, UserId: userId };
  var error = "";
  try {
    const db = client.db("Users");
    const result = db.collection("Tasks").insertOne(newTard);
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
    const result = db.collection("CEvents").updateOne(newEvent);
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
    const result = db.collection("Documents").updateOne(newDocument);
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
  const user = { UserId: userId };
  const newGroup = { $set: { Group: group } };
  var error = "";
  try {
    const db = client.db("Users");
    const result = db.collection("Accounts").updateOne(user, newGroup);
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

  const { login, password } = req.body;
  const db = client.db("Users");
  const results = await db
    .collection("Accounts")
    .find({ Login: login, Password: password })
    .toArray();
  var id = -1;
  var fn = "";
  var ln = "";
  if (results.length > 0) {
    id = results[0].UserID;
    fn = results[0].FirstName;
    ln = results[0].LastName;
  }
  var ret = { id: id, firstName: fn, lastName: ln, error: "" };
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
    .find({ Card: { $regex: _search + ".*", $options: "i" } })
    .toArray();
  var _ret = [];
  for (var i = 0; i < results.length; i++) {
    _ret.push(results[i].task);
  }
  var ret = { results: _ret, error: error };
  res.status(200).json(ret);
});

app.use((req, res, next) => {
  app.get("/api/ping", (req, res, next) => {
    res.status(200).json({ message: "Hello World" });
  });
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

app.listen(5000); // start Node + Express server on port 5000
