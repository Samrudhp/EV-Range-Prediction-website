const express = require('express')
const app = express()

require('./config/db').dbconnect();

app.get('/',(req,res)=>{
    try{
        res.send("Hello world");
    }
    catch(err){
        console.log(err);
    }
    
});