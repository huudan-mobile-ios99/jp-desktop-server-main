"use strict";

const mongoose = require('mongoose')
const AutoIncrementFactory = require('mongoose-sequence');
const username = "LeHuuDan99";
const password = "3lyIxDXEzwCtzw2i";
const database = "JPDesktop";
const URL = `mongodb+srv://${username}:${password}@clustervegas.ym3zd.mongodb.net/${database}?retryWrites=true&w=majority`;
const DB_OPTIONS = {
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
};

const connection = mongoose.createConnection(URL,DB_OPTIONS);
const AutoIncrement = AutoIncrementFactory(connection);



const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    const connect = await mongoose.connect(
      URL,
      DB_OPTIONS
    )
    console.log(`Connected to mongoDB JPDisplay!`);
    return connect;
  } catch (error) {
    console.log('Cannot connect JPDisplay')
    process.exit(1)
  }
}




module.exports = {
  connectDB: connectDB,
  URL: URL,
  AutoIncrement:AutoIncrement
}






// "use strict";

// const mongoose = require('mongoose');
// const AutoIncrementFactory = require('mongoose-sequence');

// const username = "LeHuuDan99";
// const password = "3lyIxDXEzwCtzw2i";
// const database = "JPDesktop";
// const URL = `mongodb+srv://${username}:${password}@clustervegas.ym3zd.mongodb.net/${database}?retryWrites=true&w=majority`;
// const DB_OPTIONS = {
//   maxIdleTimeMS: 60000,
//   serverSelectionTimeoutMS: 5000,
// };

// const connection = mongoose.createConnection(URL, DB_OPTIONS);
// const AutoIncrement = AutoIncrementFactory(connection);

// async function connectDB() {
//   try {
//     mongoose.set('strictQuery', true);
//     const connect = await mongoose.connect(URL, DB_OPTIONS);
//     console.log(`[${new Date().toISOString()}] ✅ Connected to MongoDB JPDisplay`);
//     setInterval(async () => {
//       if (mongoose.connection.readyState === 1) {
//         try {
//           await mongoose.connection.db.admin().ping();
//           console.log(`[${new Date().toISOString()}] [Heartbeat] MongoDB ping successful (JPDisplay)`);
//         } catch (err) {
//           console.error(`[${new Date().toISOString()}] [Heartbeat] MongoDB ping failed (JPDisplay):`, err.message);
//         }
//       }
//     }, 5 * 60 * 1000); // Every 5 minutes
//     return connect;
//   } catch (error) {
//     console.error(`[${new Date().toISOString()}] ❌ Cannot connect JPDisplay:`, error);
//     // Retry instead of exiting
//     setTimeout(connectDB, 5000);
//   }
// }

// module.exports = {
//   connectDB,
//   URL,
//   AutoIncrement,
//   connection,
// };