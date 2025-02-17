const mongoose = require('mongoose')

require('dotenv').config(MONGO_URL);

exports.dbconnect = async ()=>{
     await mongoose.connect(process.env.MONGO_URL).
     then(()=>{
           console.log('Database connected');
     }).catch((err)=>{
        console.log("error in database connection",err);
     })
}
