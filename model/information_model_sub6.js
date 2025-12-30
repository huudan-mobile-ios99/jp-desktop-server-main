
// const mongoose = require('mongoose');
// const { mongooseSub6, AutoIncrement } = require('../Mongodb_Service/mongo_config_Sub6');
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

// InformationBroadcastSchema.plugin(AutoIncrement, { inc_field: 'logId_Sub6' });

// module.exports =  mongooseSub6.model('InformationBroadcast', InformationBroadcastSchema);