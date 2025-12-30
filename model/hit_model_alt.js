

const mongoose = require("mongoose");
const { AutoIncrement, mongooseSub } = require("../Mongodb_Service/mongo_config_Hit");

// Use JPDesktop_Sub database
const db = mongooseSub.useDb("JPDesktop_Hit");

// Hit schema
const HitSchema = new mongoose.Schema(
  {
    hitSub: { type: Number, unique: true }, // Auto-incremented ID
    type: { type: String, enum: ["Jackpot", "HotSeat"], required: true },
    jackpotId: { type: String, required: true },
    jackpotName: { type: String },
    value: { type: Number, required: true },
    machineNumber: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for efficient queries and uniqueness
HitSchema.index({ machineNumber: 1, value: 1 }, { unique: true });
HitSchema.index({ jackpotId: 1, type: 1, timestamp: -1 });

// Apply AutoIncrement plugin
HitSchema.plugin(AutoIncrement, { inc_field: "hitAlt" });

const HitModelSub = db.model('Hit', HitSchema, 'hits');
module.exports = HitModelSub;