const mongoose = require('mongoose');
const { errorHandler } = require('../middleware/errorHandler');

const tripSchema = new mongoose.Schema({
    user :{
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    startLocation : String,
    endLocation : String,
    distance : Number,
    energyUsed : Number,
}) ;

module.exports = mongoose.model('Trip',tripSchema);

