const express = require("express");
const app = express();
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const MongoClient = require("mongodb").MongoClient;

const url =
  "mongodb+srv://RWUser:h6SmYQJKhA539tbG@mernproject.jqcxaqy.mongodb.net/?appName=MernProject";

const client = new MongoClient(url);

const notesRoutesPath = path.join(__dirname, "uploadFiles", "notes");
const eventsRoutesPath = path.join(__dirname, "events", "event-operations");

let noteRoutes = null;
if (fs.existsSync(`${notesRoutesPath}.js`)) {
  try {
    noteRoutes = require(notesRoutesPath);
  } catch (err) {
    console.warn(`Notes routes could not be loaded: ${err.message}`);
  }
}

let eventRoutes = null;
if (fs.existsSync(`${eventsRoutesPath}.js`)) {
  try {
    eventRoutes = require(eventsRoutesPath);
  } catch (err) {
    console.warn(`Event routes could not be loaded: ${err.message}`);
  }
}

const uploadsDir = path.join(__dirname, "uploaded_file_list");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const frontendUrl = "http://localhost:5173";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

client.connect()
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

mongoose
  .connect(url)
  .then(() => console.log("Mongoose connected"))
  .catch((err) => console.error(err));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sejalmogalgiddi29@gmail.com",
    pass: "dedh ezoa denp wiwn",
  },
});

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
    await db.collection("Tasks").insertOne(newTask);
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
    await db.collection("CEvents").insertOne(newEvent);
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
    await db.collection("Documents").insertOne(newDocument);
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
    await db.collection("Accounts").updateOne(user, newGroup);
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

    if (!user.verified) {
      return res.status(401).json({ error: "Please verify your email first" });
    }

    const token = jwt.sign(
      { userId: user.UserID },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      token,
      id: user.UserID,
      firstName: user.FirstName || "",
      lastName: user.LastName || "",
      email: user.Email,
    });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/signup", async (req, res, next) => {
  const { name, lastName, email, password } = req.body;

  let error = "";

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
      const verifyToken = Math.random().toString(36).substring(2);

      const newUser = {
        UserID: Math.floor(Math.random() * 1000000),
        Email: email,
        Password: hashedPassword,
        FirstName: name,
        LastName: lastName || "",
        verified: false,
        verifyToken: verifyToken,
      };

      await db.collection("Accounts").insertOne(newUser);

      const verifyLink = `http://localhost:5000/api/verify/${verifyToken}`;

      await transporter.sendMail({
        from: "sejalmogalgiddi29@gmail.com",
        to: email,
        subject: "Verify your account",
        html: `
          <h2>Welcome to StudyBuddies</h2>
          <p>Click below to verify your email:</p>
          <a href="${verifyLink}">Verify Account</a>
        `,
      });
    }
  } catch (e) {
    error = e.toString();
  }

  res.status(200).json({ error: error });
});

app.get("/api/verify/:token", async (req, res) => {
  const { token } = req.params;

  const db = client.db("Users");
  const user = await db.collection("Accounts").findOne({ verifyToken: token });

  if (!user) {
    return res.redirect(`${frontendUrl}/?verified=invalid`);
  }

  await db.collection("Accounts").updateOne(
    { verifyToken: token },
    { $set: { verified: true }, $unset: { verifyToken: "" } }
  );

  res.redirect(`${frontendUrl}/?verified=success`);
});

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const db = client.db("Users");
    const user = await db.collection("Accounts").findOne({ Email: email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
      const resetLink = `${frontendUrl}/reset-password?resetToken=${resetToken}`;

      await db.collection("Accounts").updateOne(
        { _id: user._id },
        {
          $set: {
            resetTokenHash,
            resetTokenExpires,
          },
        }
      );

      await transporter.sendMail({
        from: "sejalmogalgiddi29@gmail.com",
        to: email,
        subject: "Reset your StudyBuddies password",
        html: `
          <h2>Password reset request</h2>
          <p>Click below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetLink}">Reset Password</a>
        `,
      });
    }

    return res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    return res.status(500).json({ error: "Unable to process password reset request." });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token and new password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  try {
    const db = client.db("Users");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await db.collection("Accounts").findOne({
      resetTokenHash,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Reset link is invalid or has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("Accounts").updateOne(
      { _id: user._id },
      {
        $set: { Password: hashedPassword },
        $unset: { resetTokenHash: "", resetTokenExpires: "" },
      }
    );

    return res.status(200).json({ message: "Password reset successful. Please sign in." });
  } catch (err) {
    return res.status(500).json({ error: "Unable to reset password." });
  }
});

app.post("/api/searchTasks", async (req, res, next) => {
  // incoming: userId, search
  // outgoing: results[], error
  var error = "";
  const { search } = req.body;
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
  for (var i = 0; i < results.length; i++) {
    _ret.push(results[i].Task);
  }
  var ret = { results: _ret, error: error };
  res.status(200).json(ret);
});

app.get("/api/ping", (req, res, next) => {
  res.status(200).json({ message: "Hello World" });
});

if (noteRoutes) {
  app.use("/api/notes", noteRoutes);
}

if (eventRoutes) {
  app.use("/api/events", eventRoutes);
}

app.get("/test-token", (req, res) => {
  const token = jwt.sign(
    { userId: "655b4e5f1c9d440000d1a3f7" },
    "secretKey",
    { expiresIn: "1h" }
  );
  res.json({ token });
});

app.listen(5000);
