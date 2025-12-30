



const InfoModel = require('./model/information_model');
const InfoModelAlt = require('./model/information_model_alt');
const InfoModelSub = require('./model/information_model_sub');
const InfoModelSub2 = require('./model/information_model_sub2');

const IfModel = require('./model/info_model');

const formatDate = () => new Date().toISOString();

const activeWatchers = {};      // tracks running watchers
let initialized = false;        // ensures only one initializer

function handleBroadcastStream(io) {
  if (initialized) {
    console.log(`[${formatDate()}] Broadcast handler already initialized — skipping`);
    return;
  }
  initialized = true;

  const throttleWindow = 20000;
  const lastEmissionTimes = {};

  async function createWatcher(modelName, InfoModel) {
    if (!InfoModel || typeof InfoModel.watch !== "function") {
      console.error(`[${formatDate()}] Invalid model for ${modelName}`);
      return;
    }

    // Prevent duplicate watchers
    if (activeWatchers[modelName]) {
      console.warn(`[${formatDate()}] ${modelName} watcher already running — skip`);
      return;
    }

    // Wait for DB to be connected
    if (InfoModel.db.readyState !== 1) {
      console.log(`[${formatDate()}] Waiting for DB connection: ${modelName}`);
      await new Promise(resolve => InfoModel.db.once("connected", resolve));
    }

    console.log(`[${formatDate()}] 🔍 Starting watcher for ${modelName}`);
    const changeStream = InfoModel.watch(
      [{ $match: { operationType: "insert" } }],
      { fullDocument: "updateLookup" }
    );

    activeWatchers[modelName] = changeStream;

    changeStream.on("change", (change) => {
      try {
        if (change.operationType !== "insert") return;

        const now = Date.now();
        if (lastEmissionTimes[modelName] &&
            now - lastEmissionTimes[modelName] < throttleWindow) {
          return; // throttled
        }

        lastEmissionTimes[modelName] = now;

        const doc = change.fullDocument;
        console.log(`[${formatDate()}] ${modelName} Broadcast change detected`);

        // send to all
        io.emit("broadcast_latest", doc);

        // send to jackpot rooms
        if (Array.isArray(doc?.jackpots)) {
          doc.jackpots.forEach(j => {
            if (j.jackpotId) {
              io.to(`jackpot:${j.jackpotId}`).emit("broadcast_latest", doc);
            }
          });
        }

      } catch (err) {
        console.error(`[${formatDate()}] Error in ${modelName} watcher:`, err);
      }
    });

    const restart = () => {
      console.log(`[${formatDate()}] Restarting watcher for ${modelName} in 5000ms`);
      delete activeWatchers[modelName];
      setTimeout(() => createWatcher(modelName, InfoModel), 5000);
    };

    changeStream.on("error", (err) => {
      console.error(`[${formatDate()}] Watch error (${modelName}):`, err);
      try { changeStream.close(); } catch {}
      restart();
    });

    changeStream.on("close", () => {
      console.warn(`[${formatDate()}] Watch closed (${modelName})`);
      restart();
    });
  }

  // Register DBs
  const dbModels = [
    { name: '1.ALT_DB', model: InfoModelAlt },
    { name: '2.MAIN_DB', model: InfoModel },
    { name: '3.SUB_DB', model: InfoModelSub },
    { name: '4.SUB_DB2', model: InfoModelSub2 },
    { name: '5.SUB_DB3', model: IfModel },
    // { name: '6.SUB_DB6', model: information_model_sub6 },
  ];

  dbModels.forEach(({ name, model }) => createWatcher(name, model));
}

module.exports = { handleBroadcastStream };