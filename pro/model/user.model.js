const mongoose = require("mongoose");
const mongooseSchema = mongoose.Schema({
    username:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true,
       
    },
    date:{
        type:Date,
        default:Date.now
       
    },
});

const User = mongoose.model("user",mongooseSchema);
module.exports = User;