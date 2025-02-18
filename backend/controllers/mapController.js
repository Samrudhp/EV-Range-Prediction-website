const { getOptimizedRoute } = require("../utils/api");
const asyncHandler = require("express-async-handler");

exports.getRouteOptimization = asyncHandler(async(req,res)=>{
    const {start,end} = req.query;
    const optimizedRoute = await getOptimizedRoute(start,end);
    res.json(optimizedRoute);
    
})