const mongoose = require('mongoose');
const { errorHandler } = require('../middleware/errorHandler');

const tripSchema = new mongoose.Schema({
    user :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    distance: { type: Number, required: true },
    batteryUsage: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip',tripSchema);

