const asyncHandler = require("express-async-handler");
const Battery = require("../models/Battery");

exports.getBatteryStatus = asyncHandler(async(req,res)=>{
    try{
        const battery = await Battery.find({
            user : req.user.id
        });
        res.json(battery);
    } catch (err){
        res.status(404).json({
            message : "cannot get battery status"
        })
    }
});

exports.updateBatteryStatus = asyncHandler(async(req,res)=>{
   try{
    const battery = await Battery.findOneAndUpdate(
        {
            user:req.user.id
        },
        req.body,
        {
            new : true,upsert:true
        }
    );
    res.json(battery);
   } catch(err){
    res.status(401).json({
        message : "cannot update battery status",
        error :err.message,
    })
   }
});