// const mongoose = require('mongoose');
// const { mongooseSub6 } = require('../Mongodb_Service/mongodb_config_sub6');
// const db = mongooseSub6.useDb('JPDesktop');

// const HitSchema = new mongoose.Schema({
//   type: { type: String, enum: ['Jackpot', 'HotSeat'], required: true },
//   jackpotId: { type: String, required: true },
//   jackpotName: { type: String },
//   value: { type: Number, required: true },
//   machineNumber: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now },
// }, { timestamps: true });



// HitSchema.index({ machineNumber: 1, value: 1 }, { unique: true });
// HitSchema.index({ jackpotId: 1, type: 1, timestamp: -1 });


// const HitModel6 = db.model('Hit', HitSchema, 'hits');
// module.exports = HitModel6;
