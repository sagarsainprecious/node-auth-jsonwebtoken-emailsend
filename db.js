const mongoose = require("mongoose");

module.exports = () => {


    try{
        mongoose.connect(process.env.dburi);
        console.log('Connected to database');
    }catch(err){
        console.log(err);
        console.log("Could not connected to database")
    }
}

