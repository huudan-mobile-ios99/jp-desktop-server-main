"use strict";
const mongoose = require("mongoose");
const username = "lehuudan99";
 const password = "iYMlvnLT5GxsNL0f";
 const database = "JPDesktop1";
 const URL = `mongodb+srv://${username}:${password}@cluster0.ys8vqbz.mongodb.net/${database}?retryWrites=true&w=majority&appName=Cluster0`;
const DB_OPTIONS = {
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
  
};
const mongooseSub3 = mongoose.createConnection(URL, DB_OPTIONS);
let lastConnectionEvent = Date.now();


function logWithTime(message) {
  const now = Date.now();
  const diffSeconds = ((now - lastConnectionEvent) / 1000).toFixed(1);
  console.log(`${message} (+${diffSeconds}s since last event)`);
  lastConnectionEvent = now;
}

async function connectDBSUB3() {
  try {
    await mongooseSub3.asPromise();
    logWithTime("✅ Connected DBSUB3");
    // Start a heartbeat ping
    setInterval(async () => {
      try {
        await mongooseSub3.db.admin().ping();
        console.log("MongoDB SUB3 ping successful");
      } catch (err) {
        console.log("MongoDB SUB3 ping failed:", err.message);
      }
    }, 25 * 60 * 1000);

    // Connection lifecycle logs
    mongooseSub3.on("disconnected", () => {
      console.log("⚠️ MongoDB SUB3 disconnected. Retrying...");
    });

    mongooseSub3.on("reconnected", () => {
      logWithTime("✅ MongoDB SUB3 reconnected");
    });

    mongooseSub3.on("error", (err) => {
      console.log("❌ MongoDB SUB3 connection error:", err.message);
    });
  } catch (err) {
    console.log("❌ MongoDB SUB3 connection failed:", err.message);
    setTimeout(connectDBSUB3,3* 60000); // Retry after 5 seconds
  }
}

module.exports = { connectDBSUB3, mongooseSub3 };

