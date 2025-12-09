const mongoose = require('mongoose');
const { AutoIncrement } = require('../Mongodb_Service/mongo_config_Hit');
const db = mongoose.connection.useDb('JPDesktop_Hit');


const HitSchema = new mongoose.Schema({
  type: { type: String, enum: ['Jackpot', 'HotSeat'], required: true },
  jackpotId: { type: String, required: true },
  jackpotName: { type: String },
  value: { type: Number, required: true },
  machineNumber: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });



HitSchema.index({ machineNumber: 1, value: 1 }, { unique: true });
HitSchema.index({ jackpotId: 1, type: 1, timestamp: -1 });

// HitSchema.plugin(AutoIncrement, { inc_field: 'hitId' });

const Hit = db.model('Hit', HitSchema, 'hits');
module.exports = Hit;
