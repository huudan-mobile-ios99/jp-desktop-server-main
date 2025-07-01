// models/Hit.js
const mongoose = require('mongoose');
const { AutoIncrement } = require('../mongo_config');
const moment = require('moment-timezone');

const HitSchema = new mongoose.Schema({
  logId: { type: Number, unique: true },
  type: { type: String, enum: ['Jackpot', 'HotSeat'], required: true },
  jackpotId: { type: String, required: true },
  jackpotName: { type: String },
  value: { type: Number, required: true },
  machineNumber: { type: String, required: true },
  timestamp: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        required:true,type:Date,
    },
}, { timestamps: true });

// Add index for efficient querying
HitSchema.index({ jackpotId: 1, type: 1, timestamp: -1 });


module.exports = mongoose.model('Hits', HitSchema);
