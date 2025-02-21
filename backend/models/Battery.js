const mongoose = require('mongoose');

const batterySchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        batteryLevel: { 
            type: Number, 
            required: true 
        },
        lastCharged: { 
            type: Date, 
            required: true 
        },
        healthStatus: { 
            type: String, 
            required: true 
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Battery', batterySchema);