// "use strict";
// const mongoose = require('mongoose')
// const AutoIncrementFactory = require('mongoose-sequence');

// const username = "huudanstorage_db_user";
// const password = "VouZvBqdKLuxiVtS";
// const database = "JPDesktop";
// const URL = `mongodb+srv://${username}:${password}@cluster0.qpzcnil.mongodb.net/${database}?retryWrites=true&w=majority&appName=Cluster0`;

// const DB_OPTIONS = {
//   maxIdleTimeMS: 60000,
//   serverSelectionTimeoutMS: 5000,
// };
// const mongooseSub6 = mongoose.createConnection(URL, DB_OPTIONS);
// const AutoIncrement = AutoIncrementFactory(mongooseSub6);

// const connectDBHitSub6 = async () => {
//   try {
//     await mongooseSub6.asPromise();
//     console.log("✅Connected DBSUB6");

//     setInterval(async () => {
//       try {
//         await mongooseSub6.db.admin().ping();
//         console.log("MongoDB DBSUB6 ping successful");
//       } catch (err) {
//         console.log("MongoDB DBSUB6 ping failed:", err.message);
//       }
//     }, 25 * 60 * 1000);

//     mongooseSub6.on("disconnected", () => {
//       console.log("⚠️ MongoDB DBSUB6 disconnected. Retrying...");
//     });

//     mongooseSub6.on("reconnected", () => {
//       console.log("✅ MongoDB DBSUB6 reconnected");
//     });

//     mongooseSub6.on("error", (err) => {
//       console.log("❌ MongoDB DBSUB6 connection error:", err.message);
//     });
//   } catch (err) {
//     console.log("❌ MongoDB DBSUB6 connection failed:", err.message);
//     setTimeout(connectDBHitSub6,3* 60000);
//   }
// }



// module.exports = {
//   connectDBHitSub6, mongooseSub6, AutoIncrement,
// }
