const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/auth');

exports.registerUser = asyncHandler(async(req,res)=>{
    const {name,email,password} = req.body;
    const userExists = await user.findOne({
        email
    });
    if(userExists){
        res.status(400).json({
           message : "Already User Exists"
        });

    }
    const user = await User.create({name,email,password});
    if(user){
        res.status(201).json({
            _id :id,
            name : user.name,
            email : user.email,
            token : generateToken(user.id),
        });
    } else{
        res.status(400).json({
            message : "Invalid User Data"
        
        });
    }
    
});

exports.loginUser = asynchandler(async(req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email});
    if(user && (await user.matchPassword(password))){
        res.json({
            _id:user.id,
            name : user.name,
            email : user.email,
            token : generateToken(user.id),
        });
    }else{
        res.status(401);
        throw new Error('Invalid Email or Password');
    }
});

exports.getUserProfile = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user.id);
    if(user){
        res.json({
            _id : user.id,
            name : user.name,
            email :user.email,
        });

    } else{
        res.status(404);
        throw new Error('User Not Found');
    }
});
