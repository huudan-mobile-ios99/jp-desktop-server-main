"use strict";
const mongoose = require('mongoose')
const AutoIncrementFactory = require('mongoose-sequence');
const username = "huudanjr99";
const password = "YGKIeQOIzbqqB1kb";
const database = "JPDesktop";
const URL = `mongodb+srv://${username}:${password}@cluster0.qfxa2ad.mongodb.net/${database}?retryWrites=true&w=majority&appName=Cluster0`;

const DB_OPTIONS = {
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
};
const mongooseSub2 = mongoose.createConnection(URL, DB_OPTIONS);
const AutoIncrement = AutoIncrementFactory(mongooseSub2);

const connectDBHitSub2 = async () => {
  try {
    await mongooseSub2.asPromise();
    console.log("✅Connected DBSUB2");

    setInterval(async () => {
      try {
        await mongooseSub2.db.admin().ping();
        console.log("MongoDB SUB2 ping successful");
      } catch (err) {
        console.log("MongoDB SUB2 ping failed:", err.message);
      }
    }, 25 * 60 * 1000);

    mongooseSub2.on("disconnected", () => {
      console.log("⚠️ MongoDB SUB2 disconnected. Retrying...");
    });

    mongooseSub2.on("reconnected", () => {
      console.log("✅ MongoDB SUB2 reconnected");
    });

    mongooseSub2.on("error", (err) => {
      console.log("❌ MongoDB SUB2 connection error:", err.message);
    });
  } catch (err) {
    console.log("❌ MongoDB SUB2 connection failed:", err.message);
    setTimeout(connectDBHitSub2,3* 60000);
  }
}



module.exports = {
  connectDBHitSub2, mongooseSub2, AutoIncrement,
}
