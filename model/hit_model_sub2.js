// const mongoose = require('mongoose');
// const { AutoIncrement,mongooseSub2 } = require('../Mongodb_Service/mongo_config_Sub2');

// const db = mongooseSub2.useDb('JPDesktop');


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

// HitSchema.plugin(AutoIncrement, { inc_field: 'hitSub2' });

// const HitModel2 = db.model('Hit', HitSchema, 'hits');
// module.exports = HitModel2;










const mongoose = require('mongoose');
const { AutoIncrement,mongooseSub2 } = require('../Mongodb_Service/mongo_config_Sub2');
const db = mongooseSub2.useDb('JPDesktop');


const HitSchema = new mongoose.Schema({
  type: { type: String, enum: ['Jackpot', 'HotSeat'], required: true },
  jackpotId: { type: String, required: true },
  jackpotName: { type: String },
  value: { type: Number, required: true },
  machineNumber: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: -1 }, // index here instead of schema.index()
});



HitSchema.index({ machineNumber: 1, value: 1 }, { unique: true });
HitSchema.index({ jackpotId: 1, type: 1, timestamp: -1 });

HitSchema.plugin(AutoIncrement, { inc_field: 'hitSub2' });

const HitModel2 = db.model('Hit', HitSchema, 'hits');
module.exports = HitModel2;