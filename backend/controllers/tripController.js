const asyncHandler = require("express-async-handler");
const Trip = require("../models/Trip");

exports.getTrips = asyncHandler(async(req,res)=>{
    try{
        const trips = await Trip.find({
            user : req.user.id
        });
        res.json(trips);
    } catch (err){
        res.status(404).json({
            message : "cannot get trips"
        })
    }
});

exports.createTrips = asyncHandler(async(req,res)=>{
    try{
        const {startLocation,endLocation,distance} = req.body;
        const trip = await Trip.create({
            user :req.user.id,
            startLocation,
            endLocation,
            distance,
            
        });
        res.status(201).json({
            trip,
            message : "Trip Created"
        });

    } catch(err){
        res.status(401).json({
            message : "cannot create trips",
            error :err.message,
        })
    }

    
});

exports.deleteTrips = asyncHandler(async(req,res)=>{
    try{
        const trip = await Trip.findById(req.params.id);
        if(trip && trip.user.toString() === req.user.id){
            await trip.remove();
            res.json({
                message : "Trip removed"
            });
        }
        else{
            res.status(404);
            throw new Error('Trip not found');
        }
    }
    catch(err){
       res.status(404).json(
        {
            message : "cannot delete trip",
            error : err.message
        }
       );
    }
});