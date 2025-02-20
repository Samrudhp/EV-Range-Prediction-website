const User = require('../models/User');
const generateToken = require('../utils/auth');

exports.registerUser = async(req, res) => {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if(userExists) {
        return res.status(400).json({ message: "User Already Exists" });
    }
    const user = await User.create({ name, email, password });
    if(user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({ message: "Invalid User Data" });
    }
};

exports.loginUser = async(req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt with email: ${email}`);
    const user = await User.findOne({ email });
    if(user) {
        const isMatch = await user.comparePassword(password);
        console.log(`Password match: ${isMatch}`);
        if(isMatch) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid Email or Password');
        }
    } else {
        res.status(401);
        throw new Error('Invalid Email or Password');
    }
};

exports.getUserProfile = async(req, res) => {
    const user = await User.findById(req.user.id);
    if(user) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(404);
        throw new Error('User Not Found');
    }
};