const mongoose = require('mongoose');

const batterySchema = new mongoose.Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    batteryLevel : Number,
    chargingStatus : Boolean,
});

module.exports = mongoose.model('Battery',batterySchema);
