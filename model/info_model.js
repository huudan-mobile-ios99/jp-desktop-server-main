const mongoose = require("mongoose");
const { mongooseSub3 } = require("../Mongodb_Service/mongodb_config_sub3");

// Sub-schema for jackpots
const JPSchema = new mongoose.Schema({
  jackpotId: { type: String, required: true },
  jackpotName: { type: String },
  value: { type: Number, required: true },
});

// Main schema
const InfoSchema = new mongoose.Schema(
  {
    jackpots: [JPSchema],
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for efficient cleanup
InfoSchema.index({ timestamp: -1 });

// Prevent model redefinition errors
module.exports = mongooseSub3.models.InfoBroadcast || mongooseSub3.model("InfoBroadcast", InfoSchema);
