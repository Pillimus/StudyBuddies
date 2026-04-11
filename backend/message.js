const express = require("express");

function buildDirectRoomName(chatId) {
  return `direct:${chatId}`;
}

function buildGroupRoomName(groupId) {
  return `group:${groupId}`;
}

function buildUserRoomName(userId) {
  return `user:${userId}`;
}

function formatChatTimestamp(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
}

function getReadStateTimestamp(readState, viewerId) {
  if (!readState || viewerId === undefined || viewerId === null || viewerId === "") {
    return null;
  }

  const value = readState[String(viewerId)];
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function countUnreadMessages(chat, viewerId) {
  const lastReadAt = getReadStateTimestamp(chat.ReadState, viewerId);
  return (chat.Messages || []).filter((message) => {
    if (String(message.senderUserId) === String(viewerId)) {
      return false;
    }

    const createdAt = new Date(message.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      return false;
    }

    return !lastReadAt || createdAt > lastReadAt;
  }).length;
}

function buildChatMessage(message, viewerId) {
  return {
    id: message.id,
    sender: message.senderUsername,
    senderDisplayName: message.senderDisplayName,
    text: message.text,
    time: formatChatTimestamp(message.createdAt),
    mine: String(message.senderUserId) === String(viewerId),
    createdAt: message.createdAt,
  };
}

function buildDirectChatMeta(chat, viewerId) {
  const members = chat.Members || [];
  const otherMember =
    members.find(member => String(member.userId) !== String(viewerId)) ||
    members[0] ||
    null;

  if (!otherMember) {
    return {
      name: chat.Name || "Direct message",
      color: chat.Color || "#3a7bd5",
    };
  }

  return {
    name: otherMember.displayName || otherMember.username || chat.Name || "Direct message",
    color: otherMember.color || chat.Color || "#3a7bd5",
  };
}

function buildChatResponse(chat, viewerId) {
  const messages = (chat.Messages || []).map(message => buildChatMessage(message, viewerId));
  const directMeta = chat.Type === "direct" ? buildDirectChatMeta(chat, viewerId) : null;

  return {
    id: Number(chat.ChatID),
    name: directMeta?.name || chat.Name,
    type: chat.Type,
    isGroup: chat.Type === "group",
    createdBy: String(chat.CreatedByUserId || ""),
    color: directMeta?.color || chat.Color || "#3a7bd5",
    members: (chat.Members || []).map(member => ({
      userId: member.userId,
      username: member.username,
      displayName: member.displayName,
      email: member.email,
      isCreator: member.isCreator,
      color: member.color,
      avatarUrl: member.avatarUrl,
    })),
    messages,
    lastMsg: chat.LastMessageText || "",
    updatedAt: chat.UpdatedAt,
    unreadCount: countUnreadMessages(chat, viewerId),
  };
}

function buildChatLookup(userId, email, normalizeEmail) {
  const clauses = [];

  if (userId !== undefined && userId !== null && userId !== "") {
    clauses.push({ "Members.userId": userId }, { "Members.userId": Number(userId) });
  }

  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail) {
    clauses.push({ "Members.email": normalizedEmail });
  }

  return clauses.length > 0 ? { $or: clauses } : null;
}

function buildGroupMembershipLookup(userId, email, normalizeEmail) {
  const clauses = [];

  if (userId !== undefined && userId !== null && userId !== "") {
    clauses.push({ "Members.userId": userId }, { "Members.userId": Number(userId) });
  }

  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail) {
    clauses.push({ "Members.email": normalizedEmail });
  }

  return clauses.length > 0 ? { $or: clauses } : null;
}

function buildGroupChatFromGroup(group, chat, viewerId) {
  return {
    id: Number(group.GroupID),
    name: group.Name || "Untitled Group",
    type: "group",
    isGroup: true,
    createdBy: String(group.CreatedByUserId || ""),
    color: group.Color || "#7c5cfc",
    members: (group.Members || []).map(member => ({
      userId: member.userId,
      username: member.username,
      displayName: member.displayName,
      email: member.email,
      isCreator: member.isCreator,
      color: member.color,
      avatarUrl: member.avatarUrl,
    })),
    messages: (chat?.Messages || []).map(message => buildChatMessage(message, viewerId)),
    lastMsg: chat?.LastMessageText || "",
    updatedAt: chat?.UpdatedAt || group.CreatedAt || null,
    unreadCount: countUnreadMessages(chat || {}, viewerId),
  };
}

function buildBaseGroupChat(group) {
  return {
    ChatID: Number(group.GroupID),
    GroupID: Number(group.GroupID),
    Name: group.Name || "Untitled Group",
    Type: "group",
    CreatedByUserId: group.CreatedByUserId,
    Color: group.Color || "#7c5cfc",
    Members: group.Members || [],
    MemberUserIds: (group.Members || []).map(member => String(member.userId)).sort(),
    Messages: [],
    LastMessageText: "",
    LastMessageAt: null,
    CreatedAt: group.CreatedAt || new Date(),
    UpdatedAt: group.CreatedAt || new Date(),
    ReadState: {},
  };
}

async function findAccountsByUsernames(db, usernames, helpers) {
  const { normalizeUsername, escapeRegex, ensureStoredUsername } = helpers;
  const normalizedUsernames = [...new Set((usernames || []).map(normalizeUsername).filter(Boolean))];
  if (normalizedUsernames.length === 0) {
    return [];
  }

  const accounts = await db.collection("Accounts").find({
    $or: normalizedUsernames.flatMap(username => ([
      { UsernameNormalized: username },
      {
        Username: {
          $regex: `^${escapeRegex(username)}$`,
          $options: "i",
        },
      },
    ])),
  }).toArray();

  return Promise.all(accounts.map(account => ensureStoredUsername(db, account)));
}

async function syncProfileInChats(db, account, helpers) {
  const { normalizeEmail, buildDisplayName, buildAccountUsername } = helpers;
  const normalizedEmail = normalizeEmail(account.Email);
  const nextDisplayName = buildDisplayName(account);
  const nextUsername = buildAccountUsername(account);

  await db.collection("Chats").updateMany(
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
        "Members.$[member].username": nextUsername,
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

function createMessagesRouter(client, helpers, io) {
  const router = express.Router();
  const {
    normalizeEmail,
    normalizeUsername,
    escapeRegex,
    buildAccountUsername,
    buildDisplayName,
    buildMemberFromAccount,
    findAccountByIdentity,
    ensureStoredUsername,
  } = helpers;

  router.get("/users/search", async (req, res) => {
    const query = String(req.query.query || "").trim();
    const excludeUserId = req.query.excludeUserId;

    if (!query) {
      return res.status(200).json({ users: [] });
    }

    try {
      const db = client.db("Users");
      const normalizedQuery = normalizeUsername(query);
      const regex = new RegExp(escapeRegex(query), "i");
      const users = await db.collection("Accounts").find({
        $and: [
          {
            $or: [
              { UsernameNormalized: normalizedQuery },
              { Username: regex },
              { DisplayName: regex },
              { FirstName: regex },
              { LastName: regex },
              { Email: regex },
            ],
          },
          ...(excludeUserId ? [{ UserID: { $ne: Number(excludeUserId) || excludeUserId } }] : []),
        ],
      }).limit(12).toArray();

      const normalizedUsers = await Promise.all(users.map(user => ensureStoredUsername(db, user)));

      return res.status(200).json({
        users: normalizedUsers.map(user => ({
          id: user.UserID,
          username: buildAccountUsername(user),
          displayName: buildDisplayName(user),
          email: user.Email,
          avatarColor: user.AvatarColor || "#5b8dee",
          avatarUrl: user.AvatarUrl || null,
        })),
      });
    } catch (error) {
      return res.status(500).json({ error: "Unable to search users." });
    }
  });

  router.get("/chats", async (req, res) => {
    const { userId, email, type } = req.query;

    try {
      const db = client.db("Users");
      const resolvedUserId = userId ? Number(userId) || userId : "";
      const directLookup = buildChatLookup(resolvedUserId, email, normalizeEmail);
      const groupLookup = buildGroupMembershipLookup(resolvedUserId, email, normalizeEmail);

      if (!directLookup && !groupLookup) {
        return res.status(400).json({ error: "User is required." });
      }

      const chatResults = [];

      if (type !== "group") {
        const directChats = await db.collection("Chats")
          .find({ $and: [directLookup, { Type: "direct" }] })
          .sort({ UpdatedAt: -1, CreatedAt: -1 })
          .toArray();
        chatResults.push(...directChats.map(chat => buildChatResponse(chat, resolvedUserId)));
      }

      if (type !== "direct") {
        const groups = await db.collection("Groups")
          .find(groupLookup)
          .sort({ CreatedAt: -1 })
          .toArray();
        const groupIds = groups.map(group => Number(group.GroupID)).filter(Number.isFinite);
        const groupChats = groupIds.length > 0
          ? await db.collection("Chats").find({ Type: "group", GroupID: { $in: groupIds } }).toArray()
          : [];
        const chatByGroupId = new Map(groupChats.map(chat => [Number(chat.GroupID), chat]));
        chatResults.push(...groups.map(group => buildGroupChatFromGroup(group, chatByGroupId.get(Number(group.GroupID)), resolvedUserId)));
      }

      chatResults.sort((a, b) => new Date(String(b.updatedAt || 0)).getTime() - new Date(String(a.updatedAt || 0)).getTime());
      return res.status(200).json({ chats: chatResults });
    } catch (error) {
      return res.status(500).json({ error: "Unable to load chats." });
    }
  });

  router.post("/chats/direct", async (req, res) => {
    const { userId, email, targetEmail, username } = req.body;

    if ((!userId && !email) || (!targetEmail && !username)) {
      return res.status(400).json({ error: "User and target email are required." });
    }

    try {
      const db = client.db("Users");
      const currentUser = await findAccountByIdentity(db, { userId, email });

      if (!currentUser) {
        return res.status(404).json({ error: "Current user not found." });
      }

      let targetUser = null;
      if (targetEmail) {
        targetUser = await db.collection("Accounts").findOne({
          Email: {
            $regex: `^${escapeRegex(normalizeEmail(targetEmail))}$`,
            $options: "i",
          },
        });
        targetUser = await ensureStoredUsername(db, targetUser);
      } else {
        [targetUser] = await findAccountsByUsernames(db, [username], helpers);
      }
      if (!targetUser) {
        return res.status(404).json({ error: `No account found for ${targetEmail || `@${normalizeUsername(username)}`}.` });
      }

      if (String(targetUser.UserID) === String(currentUser.UserID)) {
        return res.status(400).json({ error: "You cannot message yourself." });
      }

      const memberIds = [String(currentUser.UserID), String(targetUser.UserID)].sort();
      const existingChat = await db.collection("Chats").findOne({
        Type: "direct",
        MemberUserIds: memberIds,
      });

      if (existingChat) {
        return res.status(200).json({ chat: buildChatResponse(existingChat, currentUser.UserID) });
      }

      const chat = {
        ChatID: Date.now(),
        Name: buildDisplayName(targetUser),
        Type: "direct",
        CreatedByUserId: currentUser.UserID,
        Color: targetUser.AvatarColor || "#3a7bd5",
        Members: [
          buildMemberFromAccount(currentUser, { isCreator: true, color: currentUser.AvatarColor || "#5b8dee" }),
          buildMemberFromAccount(targetUser, { color: targetUser.AvatarColor || "#3a7bd5" }),
        ],
        MemberUserIds: memberIds,
        Messages: [],
        LastMessageText: "",
        LastMessageAt: null,
        CreatedAt: new Date(),
        UpdatedAt: new Date(),
      };

      await db.collection("Chats").insertOne(chat);
      if (io) {
        io.to(buildUserRoomName(currentUser.UserID)).emit("chat:updated", { chat: buildChatResponse(chat, currentUser.UserID) });
        io.to(buildUserRoomName(targetUser.UserID)).emit("chat:updated", { chat: buildChatResponse(chat, targetUser.UserID) });
      }
      return res.status(201).json({ chat: buildChatResponse(chat, currentUser.UserID) });
    } catch (error) {
      return res.status(500).json({ error: "Unable to create direct message." });
    }
  });

  router.post("/chats/group", async (req, res) => {
    const { userId, email, groupId } = req.body;

    if ((!userId && !email) || !groupId) {
      return res.status(400).json({ error: "User and group are required." });
    }

    try {
      const db = client.db("Users");
      const currentUser = await findAccountByIdentity(db, { userId, email });

      if (!currentUser) {
        return res.status(404).json({ error: "Current user not found." });
      }

      const group = await db.collection("Groups").findOne({
        $and: [
          { GroupID: Number(groupId) || groupId },
          buildGroupMembershipLookup(currentUser.UserID, currentUser.Email, normalizeEmail),
        ],
      });

      if (!group) {
        return res.status(404).json({ error: "Group not found." });
      }

      const existingChat = await db.collection("Chats").findOne({ Type: "group", GroupID: Number(group.GroupID) });
      return res.status(200).json({ chat: buildGroupChatFromGroup(group, existingChat, currentUser.UserID) });
    } catch (error) {
      return res.status(500).json({ error: "Unable to open group chat." });
    }
  });

  router.post("/chats/:chatId/messages", async (req, res) => {
    const chatId = Number(req.params.chatId);
    const { userId, email, text, type } = req.body;

    if (!chatId || (!userId && !email) || !String(text || "").trim()) {
      return res.status(400).json({ error: "Chat, user, and message text are required." });
    }

    try {
      const db = client.db("Users");
      const currentUser = await findAccountByIdentity(db, { userId, email });

      if (!currentUser) {
        return res.status(404).json({ error: "Current user not found." });
      }

      const message = {
        id: Date.now(),
        senderUserId: currentUser.UserID,
        senderUsername: buildAccountUsername(currentUser),
        senderDisplayName: buildDisplayName(currentUser),
        text: String(text).trim(),
        createdAt: new Date(),
      };

      if (type === "group") {
        const group = await db.collection("Groups").findOne({
          $and: [
            { GroupID: chatId },
            buildGroupMembershipLookup(currentUser.UserID, currentUser.Email, normalizeEmail),
          ],
        });

        if (!group) {
          return res.status(404).json({ error: "Group not found." });
        }

        const existingGroupChat = await db.collection("Chats").findOne({ Type: "group", GroupID: chatId });
        const baseGroupChat = existingGroupChat || buildBaseGroupChat(group);

        const messages = [...(baseGroupChat.Messages || []), message];
        const updatedChat = {
          ...baseGroupChat,
          Messages: messages,
          LastMessageText: message.text,
          LastMessageAt: message.createdAt,
          UpdatedAt: message.createdAt,
          ReadState: {
            ...(baseGroupChat.ReadState || {}),
            [String(currentUser.UserID)]: message.createdAt,
          },
        };

        await db.collection("Chats").updateOne(
          { Type: "group", GroupID: chatId },
          { $set: updatedChat },
          { upsert: true },
        );

        const responseChat = buildGroupChatFromGroup(group, updatedChat, currentUser.UserID);
        if (io) {
          io.to(buildGroupRoomName(chatId)).emit("chat:updated", { chat: responseChat });
        }
        return res.status(201).json({ chat: responseChat });
      }

      const chat = await db.collection("Chats").findOne({
        ChatID: chatId,
        ...buildChatLookup(currentUser.UserID, currentUser.Email, normalizeEmail),
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found." });
      }

      const messages = [...(chat.Messages || []), message];
      const updatedChat = {
        ...chat,
        Messages: messages,
        LastMessageText: message.text,
        LastMessageAt: message.createdAt,
        UpdatedAt: message.createdAt,
        ReadState: {
          ...(chat.ReadState || {}),
          [String(currentUser.UserID)]: message.createdAt,
        },
      };

      await db.collection("Chats").updateOne(
        { ChatID: chatId },
        {
          $set: {
            Messages: messages,
            LastMessageText: message.text,
            LastMessageAt: message.createdAt,
            UpdatedAt: message.createdAt,
            ReadState: updatedChat.ReadState,
          },
        },
      );

      const responseChat = buildChatResponse(updatedChat, currentUser.UserID);
      if (io) {
        io.to(buildDirectRoomName(chatId)).emit("chat:updated", { chat: responseChat });
        for (const member of chat.Members || []) {
          io.to(buildUserRoomName(member.userId)).emit("chat:updated", { chat: buildChatResponse(updatedChat, member.userId) });
        }
      }
      return res.status(201).json({ chat: responseChat });
    } catch (error) {
      return res.status(500).json({ error: "Unable to send message." });
    }
  });

  router.patch("/chats/:chatId/read", async (req, res) => {
    const chatId = Number(req.params.chatId);
    const { userId, email, type } = req.body;

    if (!chatId || (!userId && !email)) {
      return res.status(400).json({ error: "Chat and user are required." });
    }

    try {
      const db = client.db("Users");
      const currentUser = await findAccountByIdentity(db, { userId, email });

      if (!currentUser) {
        return res.status(404).json({ error: "Current user not found." });
      }

      const readAt = new Date();

      if (type === "group") {
        const group = await db.collection("Groups").findOne({
          $and: [
            { GroupID: chatId },
            buildGroupMembershipLookup(currentUser.UserID, currentUser.Email, normalizeEmail),
          ],
        });

        if (!group) {
          return res.status(404).json({ error: "Group not found." });
        }

        const existingChat = await db.collection("Chats").findOne({ Type: "group", GroupID: chatId });
        const baseGroupChat = existingChat || buildBaseGroupChat(group);
        const updatedChat = {
          ...baseGroupChat,
          UpdatedAt: baseGroupChat.UpdatedAt || readAt,
          ReadState: {
            ...(baseGroupChat.ReadState || {}),
            [String(currentUser.UserID)]: readAt,
          },
        };

        await db.collection("Chats").updateOne(
          { Type: "group", GroupID: chatId },
          { $set: updatedChat },
          { upsert: true },
        );

        return res.status(200).json({ success: true });
      }

      const chat = await db.collection("Chats").findOne({
        ChatID: chatId,
        ...buildChatLookup(currentUser.UserID, currentUser.Email, normalizeEmail),
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found." });
      }

      await db.collection("Chats").updateOne(
        { ChatID: chatId },
        {
          $set: {
            [`ReadState.${String(currentUser.UserID)}`]: readAt,
          },
        },
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Unable to mark chat as read." });
    }
  });

  router.get("/chats/unread-count", async (req, res) => {
    const { userId, email } = req.query;

    try {
      const db = client.db("Users");
      const resolvedUserId = userId ? Number(userId) || userId : "";
      const directLookup = buildChatLookup(resolvedUserId, email, normalizeEmail);
      const groupLookup = buildGroupMembershipLookup(resolvedUserId, email, normalizeEmail);

      if (!directLookup && !groupLookup) {
        return res.status(400).json({ error: "User is required." });
      }

      let unreadCount = 0;

      const directChats = await db.collection("Chats")
        .find({ $and: [directLookup, { Type: "direct" }] })
        .toArray();
      unreadCount += directChats.reduce((sum, chat) => sum + countUnreadMessages(chat, resolvedUserId), 0);

      const groups = await db.collection("Groups").find(groupLookup).toArray();
      const groupIds = groups.map(group => Number(group.GroupID)).filter(Number.isFinite);
      if (groupIds.length > 0) {
        const groupChats = await db.collection("Chats").find({ Type: "group", GroupID: { $in: groupIds } }).toArray();
        unreadCount += groupChats.reduce((sum, chat) => sum + countUnreadMessages(chat, resolvedUserId), 0);
      }

      return res.status(200).json({ unreadCount });
    } catch (error) {
      return res.status(500).json({ error: "Unable to load unread count." });
    }
  });

  router.patch("/chats/:chatId/members", async (req, res) => {
    const chatId = Number(req.params.chatId);
    const { userId, email, usernames } = req.body;

    if (!chatId || (!userId && !email)) {
      return res.status(400).json({ error: "Chat and user are required." });
    }

    try {
      const db = client.db("Users");
      const currentUser = await findAccountByIdentity(db, { userId, email });

      if (!currentUser) {
        return res.status(404).json({ error: "Current user not found." });
      }

      const chat = await db.collection("Chats").findOne({
        ChatID: chatId,
        ...buildChatLookup(currentUser.UserID, currentUser.Email, normalizeEmail),
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found." });
      }

      if (chat.Type !== "group") {
        return res.status(400).json({ error: "You can only add members to group chats." });
      }

      if (String(chat.CreatedByUserId) !== String(currentUser.UserID)) {
        return res.status(403).json({ error: "Only the group chat creator can add members." });
      }

      const normalizedUsernames = [...new Set((usernames || []).map(normalizeUsername).filter(Boolean))];
      if (normalizedUsernames.length === 0) {
        return res.status(400).json({ error: "Add at least one username." });
      }

      const accounts = await findAccountsByUsernames(db, normalizedUsernames, helpers);
      const accountByUsername = new Map(accounts.map(account => [normalizeUsername(buildAccountUsername(account)), account]));
      const existingUsernames = new Set((chat.Members || []).map(member => normalizeUsername(member.username)));
      const missing = normalizedUsernames.filter(usernameValue => !accountByUsername.has(usernameValue));
      const duplicates = normalizedUsernames.filter(usernameValue => existingUsernames.has(usernameValue));
      const errors = [];

      if (missing.length > 0) {
        errors.push(`No account found for: ${missing.map(value => `@${value}`).join(", ")}`);
      }
      if (duplicates.length > 0) {
        errors.push(`Already in the group chat: ${duplicates.map(value => `@${value}`).join(", ")}`);
      }
      if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(" ") });
      }

      const newMembers = normalizedUsernames.map(usernameValue => {
        const account = accountByUsername.get(usernameValue);
        return buildMemberFromAccount(account, { color: account.AvatarColor || "#3a7bd5" });
      });
      const updatedMembers = [...chat.Members, ...newMembers];
      const updatedChat = {
        ...chat,
        Members: updatedMembers,
        MemberUserIds: updatedMembers.map(member => String(member.userId)).sort(),
        UpdatedAt: new Date(),
      };

      await db.collection("Chats").updateOne(
        { ChatID: chatId },
        {
          $set: {
            Members: updatedChat.Members,
            MemberUserIds: updatedChat.MemberUserIds,
            UpdatedAt: updatedChat.UpdatedAt,
          },
        },
      );

      return res.status(200).json({ chat: buildChatResponse(updatedChat, currentUser.UserID) });
    } catch (error) {
      return res.status(500).json({ error: "Unable to add members." });
    }
  });

  router.patch("/chats/:chatId/leave", async (req, res) => {
    const chatId = Number(req.params.chatId);
    const { userId, email } = req.body;

    if (!chatId || (!userId && !email)) {
      return res.status(400).json({ error: "Chat and user are required." });
    }

    try {
      const db = client.db("Users");
      const currentUser = await findAccountByIdentity(db, { userId, email });

      if (!currentUser) {
        return res.status(404).json({ error: "Current user not found." });
      }

      const chat = await db.collection("Chats").findOne({
        ChatID: chatId,
        ...buildChatLookup(currentUser.UserID, currentUser.Email, normalizeEmail),
      });

      if (!chat) {
        return res.status(404).json({ error: "Chat not found." });
      }

      if (chat.Type !== "group") {
        return res.status(400).json({ error: "Only group chats can be left." });
      }

      const remainingMembers = (chat.Members || []).filter(
        member =>
          String(member.userId) !== String(currentUser.UserID) &&
          normalizeEmail(member.email) !== normalizeEmail(currentUser.Email),
      );

      if (remainingMembers.length === 0) {
        await db.collection("Chats").deleteOne({ ChatID: chatId });
        return res.status(200).json({ success: true });
      }

      let nextCreatorId = chat.CreatedByUserId;
      const creatorLeft = String(chat.CreatedByUserId) === String(currentUser.UserID);
      const normalizedMembers = remainingMembers.map((member, index) => {
        if (!creatorLeft) {
          return member;
        }

        if (index === 0) {
          nextCreatorId = member.userId;
          return { ...member, isCreator: true };
        }

        return { ...member, isCreator: false };
      });

      await db.collection("Chats").updateOne(
        { ChatID: chatId },
        {
          $set: {
            Members: normalizedMembers,
            MemberUserIds: normalizedMembers.map(member => String(member.userId)).sort(),
            CreatedByUserId: nextCreatorId,
            UpdatedAt: new Date(),
          },
        },
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Unable to leave group chat." });
    }
  });

  return router;
}

module.exports = {
  buildDirectRoomName,
  buildGroupRoomName,
  buildUserRoomName,
  createMessagesRouter,
  syncProfileInChats,
};
