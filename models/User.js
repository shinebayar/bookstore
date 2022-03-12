const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please input your username.']
    },
    email: {
        type: String,
        required: [true, 'Please input your email.'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    role: {
        type: String,
        required: [true, 'Please input your rule'],
        enum: ['user', 'operator', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        minlength: 4,
        required: [true, 'Please input your password'],
        select: false // Can't select this field from db
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre('save', async function(){

    // to compute running millisecond
    console.time('Starting time salt');
    const salt = await bcrypt.genSalt(10);
    console.timeEnd('Ending time salt');

    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getJsonWebToken = function(){
    const token = jwt.sign({id: this._id, role: this.role}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN});
    return token;
}

UserSchema.methods.checkPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', UserSchema);