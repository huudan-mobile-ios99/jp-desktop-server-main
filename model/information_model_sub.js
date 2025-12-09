
// const mongoose = require('mongoose');
// const { AutoIncrement } = require('../Mongodb_Service/mongo_config_Sub');
// const moment = require('moment-timezone');

// const JackpotSchema = new mongoose.Schema({
//   jackpotId: { type: String, required: true },
//   jackpotName: { type: String },
//   value: { type: Number, required: true },
// });

// const InformationBroadcastSchema = new mongoose.Schema({
//   logId: { type: Number, unique: true }, // Auto-incremented ID
//   jackpots: [JackpotSchema], // Array of jackpot updates
//   timestamp: {
//         default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
//             timeZone: 'Asia/Bangkok'
//         }),
//         required:true,type:Date,
//     },
// }, { timestamps: true });

// // Add index for efficient querying
// InformationBroadcastSchema.index({ timestamp: -1 });

// // Apply auto-increment plugin for logId
// InformationBroadcastSchema.plugin(AutoIncrement, { inc_field: 'logId_Sub' });

// // Prevent model redefinition
// module.exports = mongoose.models.InformationBroadcast || mongoose.model('InformationBroadcast', InformationBroadcastSchema);





// information_model_sub2.js
const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { AutoIncrement, mongooseSub } = require('../Mongodb_Service/mongo_config_Sub');

// Jackpot schema
const JackpotSchema = new mongoose.Schema({
  jackpotId: { type: String, required: true },
  jackpotName: { type: String },
  value: { type: Number, required: true },
});

// InformationBroadcast schema
const InformationBroadcastSchema = new mongoose.Schema({
  logId_Sub: { type: Number, unique: true }, // Auto-incremented ID
  jackpots: [JackpotSchema],
  timestamp: {
    type: Date,
    required: true,
    default: () =>
      moment().tz("Asia/Bangkok").toDate(),
  },
}, { timestamps: true });

// Index for efficient queries
InformationBroadcastSchema.index({ timestamp: -1 });
InformationBroadcastSchema.plugin(AutoIncrement, { inc_field: 'logId_Sub' });




// Prevent model redefinition
module.exports =mongooseSub.model('InformationBroadcast', InformationBroadcastSchema);
// Prevent model redefinition
// module.exports = mongooseSub.models.InformationBroadcast || mongooseSub.model('InformationBroadcast', InformationBroadcastSchema);
