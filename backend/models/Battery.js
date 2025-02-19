const mongoose = require('mongoose');

const batterySchema = mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      batteryLevel: { type: Number, required: true },
    },
    { timestamps: true }
  );

module.exports = mongoose.model('Battery',batterySchema);
