"use strict";

const mongoose = require('mongoose');
const AutoIncrementFactory = require('mongoose-sequence');

const username = "LeHuuDan99";
const password = "3lyIxDXEzwCtzw2i";
const database = "JPDesktop_Hit";
const URL = `mongodb+srv://${username}:${password}@clustervegas.ym3zd.mongodb.net/${database}?retryWrites=true&w=majority`;
const DB_OPTIONS = {
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
};

// Use createConnection for AutoIncrement and main connection
const connection = mongoose.createConnection(URL, DB_OPTIONS);
const AutoIncrement = AutoIncrementFactory(connection);

async function connectDBHit() {
  const connectWithRetry = async () => {
    try {
        setInterval(async () => {
        if (mongoose.connection.readyState === 1) {
          try {
            await mongoose.connection.db.admin().ping();
            console.log("[Heartbeat] MongoDB SUB ping successful JPDesktop_Hit");
          } catch (err) {
            console.error("[Heartbeat] MongoDB SUB ping failed JPDesktop_Hit:", err.message);
          }
        }
        }, 15 * 60 * 1000); //every 15 min
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ MongoDB connection failed (JPDesktop_Hit). Retrying in 5 seconds...`, err);
      setTimeout(connectWithRetry, 10000);
    }
  };

  connectWithRetry();

  connection.on('disconnected', () => {
    console.warn(`[${new Date().toISOString()}] ⚠️ MongoDB disconnected (JPDesktop_Hit). Trying to reconnect...`);
  });

  connection.on('reconnected', () => {
    console.log(`[${new Date().toISOString()}] ✅ MongoDB reconnected (JPDesktop_Hit)`);
  });

  connection.on('error', (err) => {
    console.error(`[${new Date().toISOString()}] ❌ MongoDB connection error (JPDesktop_Hit):`, err);
  });
}

module.exports = {
  connectDBHit,
  URL,
  AutoIncrement,
  connection,
};
