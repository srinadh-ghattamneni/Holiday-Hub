const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose =require("passport-local-mongoose");

const userSchema =new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    lastOtpSent: { type: Date } 
});

userSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model("User",userSchema);