
const mongoose = require('mongoose');
const { mongooseSub2, AutoIncrement } = require('../Mongodb_Service/mongo_config_Sub2');
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
// InformationBroadcastSchema.index({ timestamp: -1 });
InformationBroadcastSchema.plugin(AutoIncrement, { inc_field: 'logId_Sub2' });

// Prevent model redefinition
// module.exports = mongooseSub2.models.InformationBroadcast || mongooseSub2.model('InformationBroadcast', InformationBroadcastSchema);
module.exports =  mongooseSub2.model('InformationBroadcast', InformationBroadcastSchema);
