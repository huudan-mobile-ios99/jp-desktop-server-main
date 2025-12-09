"use strict";
const mongoose = require('mongoose')
const AutoIncrementFactory = require('mongoose-sequence');
const username = "huudanmobileios99";
const password = "z9n7lia2WHpZOYqk";
const database = "JPDesktop_Sub";
const URL = `mongodb+srv://${username}:${password}@cluster0.psx2l8d.mongodb.net/${database}?retryWrites=true&w=majority&appName=Cluster0`;
const DB_OPTIONS = {
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
};

const mongooseSub = mongoose.createConnection(URL,DB_OPTIONS);
const AutoIncrement = AutoIncrementFactory(mongooseSub);



const connectDBHitSub1 = async () => {
  try {
    await mongooseSub.asPromise();
    console.log("✅ Connected DBSUB2");

    setInterval(async () => {
      try {
        await mongooseSub.db.admin().ping();
        console.log("MongoDB SUB2 ping successful");
      } catch (err) {
        console.log("MongoDB SUB2 ping failed:", err.message);
      }
    }, 30 * 60 * 1000);

    mongooseSub.on("disconnected", () => {
      console.log("⚠️ MongoDB SUB2 disconnected. Retrying...");
    });

    mongooseSub.on("reconnected", () => {
      console.log("✅ MongoDB SUB2 reconnected");
    });

    mongooseSub.on("error", (err) => {
      console.log("❌ MongoDB SUB2 connection error:", err.message);
    });
  } catch (err) {
    console.log("❌ MongoDB SUB2 connection failed:", err.message);
    setTimeout(connectDBHitSub1,3* 60000);
  }
}



module.exports = {
  connectDBHitSub1, mongooseSub, AutoIncrement,
}
