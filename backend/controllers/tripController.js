
const Trip = require("../models/Trip");
const User = require("../models/User");

// exports.getTrips = asyncHandler(async(req,res)=>{
//     try{
//         const trips = await Trip.find({
//             user : req.user.id
//         });
//         res.json(trips);
//     } catch (err){
//         res.status(404).json({
//             message : "cannot get trips"
//         })
//     }
// });

// exports.createTrips = asyncHandler(async(req,res)=>{
//     try{
//         const {startLocation,endLocation,distance} = req.body;
//         const trip = await Trip.create({
//             user :req.user.id,
//             startLocation,
//             endLocation,
//             distance,
            
//         });
//         res.status(201).json({
//             trip,
//             message : "Trip Created"
//         });

//     } catch(err){
//         res.status(401).json({
//             message : "cannot create trips",
//             error :err.message,
//         })
//     }

    
// });

// exports.deleteTrips = asyncHandler(async(req,res)=>{
//     try{
//         const trip = await Trip.findById(req.params.id);
//         if(trip && trip.user.toString() === req.user.id){
//             await trip.remove();
//             res.json({
//                 message : "Trip removed"
//             });
//         }
//         else{
//             res.status(404);
//             throw new Error('Trip not found');
//         }
//     }
//     catch(err){
//        res.status(404).json(
//         {
//             message : "cannot delete trip",
//             error : err.message
//         }
//        );
//     }
// });



// @desc    Add a new trip
// @route   POST /api/trips/add
// @access  Private
exports.addTrip = async (req, res) => {
    try {
        const { startLocation, endLocation, distance, duration, energyUsed } = req.body;

        if (!startLocation || !endLocation || !distance || !duration || !energyUsed) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const trip = new Trip({
            user: req.user.id,
            startLocation,
            endLocation,
            distance,
            duration,
            energyUsed
        });

        await trip.save();
        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get user's trip history
// @route   GET /api/trips/history
// @access  Private
exports.getTripsByUser = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });

        if (!trips.length) {
            return res.status(404).json({ message: "No trips found" });
        }

        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};