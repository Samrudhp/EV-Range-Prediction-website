const mongoose = require('mongoose');
const { errorHandler } = require('../middleware/errorHandler');

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    distance: { type: Number, required: true },
    energyUsed: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);