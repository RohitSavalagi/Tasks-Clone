import express from "express";
import path from "path";
import dotenv from "dotenv";
import { MongoClient, Db } from "mongodb";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Real-time clients array
let sseClients: { id: number; res: express.Response }[] = [];

// Seed default data for sandbox
let localLists = [
  { id: "my-tasks", name: "My Tasks", icon: "List", isSystem: true },
  { id: "work", name: "Work", icon: "Briefcase", isSystem: true },
  { id: "personal", name: "Personal", icon: "User", isSystem: true },
  { id: "groceries", name: "Groceries", icon: "ShoppingBag", isSystem: true }
];

let localTasks = [
  {
    id: "task-1",
    title: "Finalize project proposal for the board",
    notes: "Review slides with marketing team and consolidate financial sheets.",
    isCompleted: false,
    isStarred: false,
    dueDate: "Today, 4:00 PM",
    recurrence: "Repeats monthly",
    listId: "my-tasks",
    subtasks: [
      { id: "sub-1", title: "Finalize budget slides", isCompleted: true },
      { id: "sub-2", title: "Proofread timeline details", isCompleted: false },
      { id: "sub-3", title: "Send preview to team", isCompleted: false }
    ],
    createdDate: "Oct 24, 10:14 AM"
  },
  {
    id: "task-2",
    title: "Schedule dentist appointment",
    notes: "Routine cleaning and checkup.",
    isCompleted: false,
    isStarred: true,
    dueDate: "Tomorrow",
    listId: "my-tasks",
    subtasks: [],
    createdDate: "Oct 24, 09:30 AM"
  },
  {
    id: "task-3",
    title: "Research new productivity tools",
    notes: "Identify gaps in current team velocity.",
    isCompleted: false,
    isStarred: false,
    dueDate: "Next week",
    listId: "my-tasks",
    subtasks: [
      { id: "sub-4", title: "Read tech reports on Notion and Linear", isCompleted: true },
      { id: "sub-5", title: "Setup 14-day trial account", isCompleted: false }
    ],
    createdDate: "Oct 23, 02:15 PM"
  }
];

// Database state
let mongoClient: MongoClient | null = null;
let database: Db | null = null;
let isMongoAttempted = false;

async function getDb(): Promise<{ db: Db | null; isSandbox: boolean }> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes("<username>")) {
    return { db: null, isSandbox: true };
  }

  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        serverSelectionTimeoutMS: 5000,
      });
      await mongoClient.connect();
      database = mongoClient.db();
      console.log("Connected to MongoDB successfully!");
      
      // Auto seed db if empty
      const listsCol = database.collection("lists");
      const listCount = await listsCol.countDocuments();
      if (listCount === 0) {
        await listsCol.insertMany(localLists);
        await database.collection("tasks").insertMany(localTasks);
        console.log("Successfully seeded MongoDB with starter lists and tasks!");
      }
    }
    return { db: database, isSandbox: false };
  } catch (error) {
    if (!isMongoAttempted) {
      console.error("MongoDB Connection failure. Falling back to local Express In-Memory database sandbox.", error);
      isMongoAttempted = true;
    }
    return { db: null, isSandbox: true };
  }
}

// Event broadcasting helper
function broadcast(type: string, data?: any) {
  const payload = JSON.stringify({ type, data });
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch (e) {
      // client broken
    }
  });
}

// Real-Time Server-Sent Events Endpoint
app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  res.write("\n");

  const client = { id: Date.now(), res };
  sseClients.push(client);

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c.id !== client.id);
  });
});

// Endpoint: Database Health status
app.get("/api/status", async (req, res) => {
  const { isSandbox } = await getDb();
  res.json({
    connected: !isSandbox,
    backendType: isSandbox ? "Local In-Memory Database Sandbox" : "Live MongoDB Cloud Database",
    uriProvided: !!process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("<username>"),
  });
});

// Endpoint: GET all task lists
app.get("/api/lists", async (req, res) => {
  const { db, isSandbox } = await getDb();
  if (isSandbox) {
    res.json(localLists);
  } else if (db) {
    const data = await db.collection("lists").find({}).toArray();
    res.json(data);
  }
});

// EndpointToken: Create/Update a list
app.post("/api/lists", async (req, res) => {
  const { db, isSandbox } = await getDb();
  const newList = req.body;
  if (isSandbox) {
    localLists.push(newList);
    res.json(newList);
  } else if (db) {
    await db.collection("lists").replaceOne({ id: newList.id }, newList, { upsert: true });
    res.json(newList);
  }
  broadcast("LISTS_UPDATED");
});

// EndpointToken: Delete custom lists
app.delete("/api/lists/:id", async (req, res) => {
  const { db, isSandbox } = await getDb();
  const listId = req.params.id;
  if (isSandbox) {
    localLists = localLists.filter((l) => l.id !== listId);
    localTasks = localTasks.filter((t) => t.listId !== listId);
    res.json({ success: true });
  } else if (db) {
    await db.collection("lists").deleteOne({ id: listId });
    await db.collection("tasks").deleteMany({ listId: listId });
    res.json({ success: true });
  }
  broadcast("LISTS_UPDATED");
  broadcast("TASKS_UPDATED");
});

// Endpoint: GET all tasks
app.get("/api/tasks", async (req, res) => {
  const { db, isSandbox } = await getDb();
  if (isSandbox) {
    res.json(localTasks);
  } else if (db) {
    const data = await db.collection("tasks").find({}).toArray();
    res.json(data);
  }
});

// EndpointToken: Single task creator
app.post("/api/tasks", async (req, res) => {
  const { db, isSandbox } = await getDb();
  const task = req.body;
  if (isSandbox) {
    localTasks.unshift(task);
    res.json(task);
  } else if (db) {
    await db.collection("tasks").insertOne(task);
    res.json(task);
  }
  broadcast("TASKS_UPDATED");
});

// EndpointToken: Bulk synchronization (reorders, drags)
app.post("/api/tasks/sync", async (req, res) => {
  const { db, isSandbox } = await getDb();
  const syncTasks = req.body;
  if (isSandbox) {
    localTasks = syncTasks;
    res.json({ success: true });
  } else if (db) {
    // Clear existing values and insert updated order securely
    await db.collection("tasks").deleteMany({});
    if (syncTasks.length > 0) {
      await db.collection("tasks").insertMany(syncTasks);
    }
    res.json({ success: true });
  }
  broadcast("TASKS_UPDATED");
});

// EndpointToken: Update single task
app.put("/api/tasks/:id", async (req, res) => {
  const { db, isSandbox } = await getDb();
  const taskId = req.params.id;
  const updatedTask = req.body;
  
  if (isSandbox) {
    localTasks = localTasks.map((t) => (t.id === taskId ? updatedTask : t));
    res.json(updatedTask);
  } else if (db) {
    await db.collection("tasks").replaceOne({ id: taskId }, updatedTask);
    res.json(updatedTask);
  }
  broadcast("TASKS_UPDATED");
});

// EndpointToken: Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  const { db, isSandbox } = await getDb();
  const taskId = req.params.id;
  if (isSandbox) {
    localTasks = localTasks.filter((t) => t.id !== taskId);
    res.json({ success: true });
  } else if (db) {
    await db.collection("tasks").deleteOne({ id: taskId });
    res.json({ success: true });
  }
  broadcast("TASKS_UPDATED");
});


// Vite Middleware Integration Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Backend Server initialized. Running at http://localhost:${PORT}`);
  });
}

startServer();
