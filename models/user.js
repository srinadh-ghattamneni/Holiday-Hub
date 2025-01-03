const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passportLocalMongoose =require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpires: Date,
    lastOtpSent: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

userSchema.plugin(passportLocalMongoose);

module.exports= mongoose.model("User",userSchema);