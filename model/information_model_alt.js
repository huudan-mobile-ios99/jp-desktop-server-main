
const mongoose = require('mongoose');
const { AutoIncrement } = require('../Mongodb_Service/mongo_config_Hit');
const moment = require('moment-timezone');

const JackpotSchema = new mongoose.Schema({
  jackpotId: { type: String, required: true },
  jackpotName: { type: String },
  value: { type: Number, required: true },
});

const InformationBroadcastSchema = new mongoose.Schema({
  logId: { type: Number, unique: true }, // Auto-incremented ID
  jackpots: [JackpotSchema], // Array of jackpot updates
  timestamp: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        required:true,type:Date,
    },
}, { timestamps: true });

// Add index for efficient querying
InformationBroadcastSchema.index({ timestamp: -1 });

// Apply auto-increment plugin for logId
InformationBroadcastSchema.plugin(AutoIncrement, { inc_field: 'logId_alt' });

const db2 = mongoose.connection.useDb('JPDesktop_Hit'); // must match DB name in MongoDB
module.exports = db2.model('InformationBroadcast', InformationBroadcastSchema);


// // Prevent model redefinition
// module.exports = mongoose.models.InformationBroadcast || mongoose.model('InformationBroadcast', InformationBroadcastSchema);

