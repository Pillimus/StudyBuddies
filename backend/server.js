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
const config = require("./config");

const url = config.mongodbUri;

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

const frontendUrl = config.frontendUrl;
const apiBaseUrl = config.apiBaseUrl;
const JWT_SECRET = config.jwtSecret;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

client
  .connect()
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

mongoose
  .connect(url)
  .then(() => console.log("Mongoose connected"))
  .catch((err) => console.error(err));

const transporter = nodemailer.createTransport({
  service: config.emailService,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

var taskList = [];
var cEventList = [];
var documentsList = [];
var groupList = [];

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildEmailQuery(email) {
  const normalizedEmail = normalizeEmail(email);
  return {
    Email: {
      $regex: `^${escapeRegex(normalizedEmail)}$`,
      $options: "i",
    },
  };
}

function buildDisplayName(account) {
  const customDisplayName = String(account.DisplayName || "").trim();
  if (customDisplayName) {
    return customDisplayName;
  }

  const fullName = [account.FirstName, account.LastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName || normalizeEmail(account.Email).split("@")[0] || "User";
}

function buildMemberFromAccount(account, overrides = {}) {
  return {
    userId: account.UserID,
    username: buildDisplayName(account),
    displayName: buildDisplayName(account),
    email: normalizeEmail(account.Email),
    isCreator: Boolean(overrides.isCreator),
    color: overrides.color || account.AvatarColor || "#5b8dee",
    avatarUrl: overrides.avatarUrl || account.AvatarUrl || undefined,
  };
}

function buildUserProfile(account) {
  return {
    displayName: buildDisplayName(account),
    avatarUrl: account.AvatarUrl || null,
    avatarColor: account.AvatarColor || "#5b8dee",
  };
}

function buildUserResponse(account, extra = {}) {
  return {
    id: account.UserID,
    email: account.Email,
    firstName: account.FirstName || "",
    lastName: account.LastName || "",
    ...buildUserProfile(account),
    ...extra,
  };
}

async function findAccountByIdentity(db, { userId, email }) {
  const clauses = [];

  if (userId !== undefined && userId !== null && userId !== "") {
    clauses.push({ UserID: userId }, { UserID: Number(userId) });
  }

  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail) {
    clauses.push(buildEmailQuery(normalizedEmail));
  }

  if (clauses.length === 0) {
    return null;
  }

  return db.collection("Accounts").findOne({ $or: clauses });
}

async function syncProfileInGroups(db, account) {
  const normalizedEmail = normalizeEmail(account.Email);
  const nextDisplayName = buildDisplayName(account);

  await db.collection("Groups").updateMany(
    {
      Members: {
        $elemMatch: {
          $or: [
            { userId: account.UserID },
            { userId: Number(account.UserID) },
            { email: normalizedEmail },
          ],
        },
      },
    },
    {
      $set: {
        "Members.$[member].username": nextDisplayName,
        "Members.$[member].displayName": nextDisplayName,
        "Members.$[member].avatarUrl": account.AvatarUrl || undefined,
        "Members.$[member].color": account.AvatarColor || "#5b8dee",
      },
    },
    {
      arrayFilters: [
        {
          $or: [
            { "member.userId": account.UserID },
            { "member.userId": Number(account.UserID) },
            { "member.email": normalizedEmail },
          ],
        },
      ],
    },
  );
}

async function findAccountsByEmails(db, emails) {
  const normalizedEmails = [
    ...new Set((emails || []).map(normalizeEmail).filter(Boolean)),
  ];
  if (normalizedEmails.length === 0) {
    return [];
  }

  return db
    .collection("Accounts")
    .find({
      $or: normalizedEmails.map((email) => buildEmailQuery(email)),
    })
    .toArray();
}

function buildGroupLookup(userId, email) {
  const clauses = [];

  if (userId !== undefined && userId !== null && userId !== "") {
    clauses.push({ "Members.userId": userId });
  }

  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail) {
    clauses.push({ "Members.email": normalizedEmail });
  }

  return clauses.length > 0 ? { $or: clauses } : null;
}

app.post("/api/sync-google-user", async (req, res) => {
  const { email, firstName, lastName, supabaseId } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !supabaseId) {
    return res
      .status(400)
      .json({ error: "Email and Supabase user id are required." });
  }

  try {
    const db = client.db("Users");
    const existingUser = await db
      .collection("Accounts")
      .findOne(buildEmailQuery(normalizedEmail));

    if (existingUser) {
      await db.collection("Accounts").updateOne(
        { _id: existingUser._id },
        {
          $set: {
            Email: normalizedEmail,
            FirstName: firstName || existingUser.FirstName || "",
            LastName: lastName || existingUser.LastName || "",
            verified: true,
            AuthProvider: "google",
            SupabaseUserID: supabaseId,
          },
        },
      );

      const updatedUser = await db
        .collection("Accounts")
        .findOne({ _id: existingUser._id });
      return res.status(200).json(buildUserResponse(updatedUser));
    }

    const newUser = {
      UserID: supabaseId,
      SupabaseUserID: supabaseId,
      Email: normalizedEmail,
      Password: null,
      FirstName: firstName || "",
      LastName: lastName || "",
      DisplayName: "",
      AvatarUrl: "",
      AvatarColor: "#5b8dee",
      verified: true,
      AuthProvider: "google",
    };

    await db.collection("Accounts").insertOne(newUser);

    return res.status(200).json(buildUserResponse(newUser));
  } catch (error) {
    return res.status(500).json({ error: "Unable to sync Google user." });
  }
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
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
    const normalizedEmail = normalizeEmail(email);

    const db = client.db("Users");
    const user = await db
      .collection("Accounts")
      .findOne(buildEmailQuery(normalizedEmail));

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

    const token = jwt.sign({ userId: user.UserID }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json(buildUserResponse(user, { token }));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/signup", async (req, res, next) => {
  const { name, lastName, email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  let error = "";

  try {
    const db = client.db("Users");

    const existing = await db
      .collection("Accounts")
      .find(buildEmailQuery(normalizedEmail))
      .toArray();

    if (existing.length > 0) {
      error = "User already exists";
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verifyToken = Math.random().toString(36).substring(2);

      const newUser = {
        UserID: Math.floor(Math.random() * 1000000),
        Email: normalizedEmail,
        Password: hashedPassword,
        FirstName: name,
        LastName: lastName || "",
        DisplayName: "",
        AvatarUrl: "",
        AvatarColor: "#5b8dee",
        verified: false,
        verifyToken: verifyToken,
      };

      await db.collection("Accounts").insertOne(newUser);

      const verifyLink = `${apiBaseUrl}/api/verify/${verifyToken}`;

      await transporter.sendMail({
        from: config.emailFrom,
        to: normalizedEmail,
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

  await db
    .collection("Accounts")
    .updateOne(
      { verifyToken: token },
      { $set: { verified: true }, $unset: { verifyToken: "" } },
    );

  res.redirect(`${frontendUrl}/?verified=success`);
});

app.get("/api/profile", async (req, res) => {
  const { userId, email } = req.query;

  try {
    const db = client.db("Users");
    const user = await findAccountByIdentity(db, { userId, email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(200).json(buildUserResponse(user));
  } catch (error) {
    return res.status(500).json({ error: "Unable to load profile." });
  }
});

app.put("/api/profile", async (req, res) => {
  const { userId, email, displayName, avatarUrl, avatarColor } = req.body;

  try {
    const db = client.db("Users");
    const user = await findAccountByIdentity(db, { userId, email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const nextDisplayName = String(displayName || "").trim();
    const nextAvatarUrl = typeof avatarUrl === "string" ? avatarUrl.trim() : "";
    const nextAvatarColor =
      String(avatarColor || user.AvatarColor || "#5b8dee").trim() || "#5b8dee";

    await db.collection("Accounts").updateOne(
      { _id: user._id },
      {
        $set: {
          DisplayName: nextDisplayName,
          AvatarUrl: nextAvatarUrl,
          AvatarColor: nextAvatarColor,
        },
      },
    );

    const updatedUser = await db
      .collection("Accounts")
      .findOne({ _id: user._id });
    await syncProfileInGroups(db, updatedUser);

    return res.status(200).json(buildUserResponse(updatedUser));
  } catch (error) {
    return res.status(500).json({ error: "Unable to update profile." });
  }
});

app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const db = client.db("Users");
    const user = await db
      .collection("Accounts")
      .findOne(buildEmailQuery(normalizedEmail));

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
        },
      );

      await transporter.sendMail({
        from: config.emailFrom,
        to: normalizedEmail,
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
    return res
      .status(500)
      .json({ error: "Unable to process password reset request." });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ error: "Token and new password are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters long" });
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
      return res
        .status(400)
        .json({ error: "Reset link is invalid or has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("Accounts").updateOne(
      { _id: user._id },
      {
        $set: { Password: hashedPassword },
        $unset: { resetTokenHash: "", resetTokenExpires: "" },
      },
    );

    return res
      .status(200)
      .json({ message: "Password reset successful. Please sign in." });
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

app.get("/api/groups", async (req, res) => {
  const { userId, email } = req.query;

  try {
    const db = client.db("Users");
    const lookup = buildGroupLookup(
      userId ? Number(userId) || userId : "",
      email,
    );

    if (!lookup) {
      return res.status(400).json({ error: "User is required." });
    }

    const groups = await db
      .collection("Groups")
      .find(lookup)
      .sort({ CreatedAt: -1 })
      .toArray();
    return res.status(200).json({ groups });
  } catch (error) {
    return res.status(500).json({ error: "Unable to load groups." });
  }
});

app.post("/api/groups", async (req, res) => {
  const { userId, email, name, color, avatarUrl, memberEmails } = req.body;

  if (!userId || !name?.trim()) {
    return res.status(400).json({ error: "Group name and user are required." });
  }

  try {
    const db = client.db("Users");
    const creator = await db.collection("Accounts").findOne({
      $or: [
        { UserID: userId },
        { UserID: Number(userId) },
        buildEmailQuery(email),
      ],
    });

    if (!creator) {
      return res.status(404).json({ error: "Creator account not found." });
    }

    const requestedEmails = [
      ...new Set((memberEmails || []).map(normalizeEmail).filter(Boolean)),
    ];
    const accounts = await findAccountsByEmails(db, requestedEmails);
    const accountByEmail = new Map(
      accounts.map((account) => [normalizeEmail(account.Email), account]),
    );
    const invalidEmails = requestedEmails.filter(
      (memberEmail) => !accountByEmail.has(memberEmail),
    );

    if (invalidEmails.length > 0) {
      return res
        .status(400)
        .json({ error: `No account found for: ${invalidEmails.join(", ")}` });
    }

    const creatorMember = buildMemberFromAccount(creator, {
      isCreator: true,
      color: "#5b8dee",
    });
    const members = [creatorMember];

    for (const memberEmail of requestedEmails) {
      const account = accountByEmail.get(memberEmail);
      if (!account || account.UserID === creator.UserID) continue;

      members.push(
        buildMemberFromAccount(account, {
          color: "#3a7bd5",
        }),
      );
    }

    const group = {
      GroupID: Date.now(),
      Name: name.trim(),
      CreatedByUserId: creator.UserID,
      Color: color || "#7c5cfc",
      AvatarUrl: avatarUrl || undefined,
      Members: members,
      Events: [],
      CreatedAt: new Date(),
    };

    await db.collection("Groups").insertOne(group);
    return res.status(201).json({ group });
  } catch (error) {
    return res.status(500).json({ error: "Unable to create group." });
  }
});

app.patch("/api/groups/:groupId/members", async (req, res) => {
  const groupId = Number(req.params.groupId);
  const { userId, memberEmails } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({ error: "Group and user are required." });
  }

  try {
    const db = client.db("Users");
    const group = await db.collection("Groups").findOne({ GroupID: groupId });

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (String(group.CreatedByUserId) !== String(userId)) {
      return res
        .status(403)
        .json({ error: "Only the group creator can add members." });
    }

    const requestedEmails = [
      ...new Set((memberEmails || []).map(normalizeEmail).filter(Boolean)),
    ];
    if (requestedEmails.length === 0) {
      return res.status(400).json({ error: "At least one email is required." });
    }

    const existingEmails = new Set(
      (group.Members || []).map((member) => normalizeEmail(member.email)),
    );
    const duplicateEmails = requestedEmails.filter((memberEmail) =>
      existingEmails.has(memberEmail),
    );
    const accounts = await findAccountsByEmails(db, requestedEmails);
    const accountByEmail = new Map(
      accounts.map((account) => [normalizeEmail(account.Email), account]),
    );
    const invalidEmails = requestedEmails.filter(
      (memberEmail) => !accountByEmail.has(memberEmail),
    );

    if (invalidEmails.length > 0 || duplicateEmails.length > 0) {
      const errors = [];
      if (invalidEmails.length > 0)
        errors.push(`No account found for: ${invalidEmails.join(", ")}`);
      if (duplicateEmails.length > 0)
        errors.push(`Already in the group: ${duplicateEmails.join(", ")}`);
      return res.status(400).json({ error: errors.join(" ") });
    }

    const newMembers = requestedEmails.map((memberEmail) =>
      buildMemberFromAccount(accountByEmail.get(memberEmail), {
        color: "#3a7bd5",
      }),
    );

    const updatedMembers = [...group.Members, ...newMembers];
    await db
      .collection("Groups")
      .updateOne({ GroupID: groupId }, { $set: { Members: updatedMembers } });

    return res
      .status(200)
      .json({ group: { ...group, Members: updatedMembers } });
  } catch (error) {
    return res.status(500).json({ error: "Unable to add members." });
  }
});

app.delete("/api/groups/:groupId/members", async (req, res) => {
  const groupId = Number(req.params.groupId);
  const { userId, memberEmail } = req.body;

  if (!groupId || !userId || !memberEmail) {
    return res
      .status(400)
      .json({ error: "Group, user, and member email are required." });
  }

  try {
    const db = client.db("Users");
    const group = await db.collection("Groups").findOne({ GroupID: groupId });

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (String(group.CreatedByUserId) !== String(userId)) {
      return res
        .status(403)
        .json({ error: "Only the group creator can remove members." });
    }

    const normalizedMemberEmail = normalizeEmail(memberEmail);
    const memberToRemove = (group.Members || []).find(
      (member) => normalizeEmail(member.email) === normalizedMemberEmail,
    );

    if (!memberToRemove) {
      return res.status(404).json({ error: "Member not found in this group." });
    }

    if (memberToRemove.isCreator) {
      return res
        .status(400)
        .json({ error: "The group creator cannot be removed." });
    }

    const updatedMembers = (group.Members || []).filter(
      (member) => normalizeEmail(member.email) !== normalizedMemberEmail,
    );
    await db
      .collection("Groups")
      .updateOne({ GroupID: groupId }, { $set: { Members: updatedMembers } });

    return res
      .status(200)
      .json({ group: { ...group, Members: updatedMembers } });
  } catch (error) {
    return res.status(500).json({ error: "Unable to remove member." });
  }
});

app.patch("/api/groups/:groupId/leave", async (req, res) => {
  const groupId = Number(req.params.groupId);
  const { userId, email } = req.body;

  if (!groupId || (!userId && !email)) {
    return res.status(400).json({ error: "Group and user are required." });
  }

  try {
    const db = client.db("Users");
    const group = await db.collection("Groups").findOne({ GroupID: groupId });

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    const normalizedEmail = normalizeEmail(email);
    const remainingMembers = (group.Members || []).filter(
      (member) =>
        String(member.userId) !== String(userId) &&
        normalizeEmail(member.email) !== normalizedEmail,
    );

    if (remainingMembers.length === group.Members.length) {
      return res
        .status(404)
        .json({ error: "You are not a member of this group." });
    }

    if (remainingMembers.length === 0) {
      await db.collection("Groups").deleteOne({ GroupID: groupId });
      return res.status(200).json({ success: true });
    }

    let createdByUserId = group.CreatedByUserId;
    const creatorLeft =
      String(group.CreatedByUserId) === String(userId) ||
      normalizeEmail(
        (group.Members || []).find((member) => member.isCreator)?.email,
      ) === normalizedEmail;

    const normalizedMembers = remainingMembers.map((member, index) => {
      if (!creatorLeft) {
        return member;
      }

      if (index === 0) {
        createdByUserId = member.userId;
        return { ...member, isCreator: true };
      }

      return { ...member, isCreator: false };
    });

    await db
      .collection("Groups")
      .updateOne(
        { GroupID: groupId },
        {
          $set: {
            Members: normalizedMembers,
            CreatedByUserId: createdByUserId,
          },
        },
      );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Unable to leave group." });
  }
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
  const token = jwt.sign({ userId: "655b4e5f1c9d440000d1a3f7" }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
