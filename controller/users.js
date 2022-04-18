const path = require('path');
const crypto = require('crypto');

const User = require('../models/User');
const MyError = require('../utils/myError');
const asyncHandler = require('../middleware/asyncHandler');
const paginate = require('../utils/paginate');
const sendEmail = require('../utils/email');

exports.registerUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);
    res.status(200).json({
        success: true,
        token: user.getJsonWebToken(), // that method is written in user model
        user: user
    });
});

exports.loginUser = asyncHandler(async (req, res, next) => { 
    const {email, password} = req.body;
    if( !email || !password ) throw new MyError('Email and Password must not be empty.', 400);

    // password field is configured must not select in model. But in controller using +password expression can select that field
    const user = await User.findOne({ email }).select('+password');

    if( !user ) throw new MyError('Email or password is not correct', 400);

    // checkPassword method is written in user model.
    const isPasswordCorrect = await user.checkPassword(password);

    if( !isPasswordCorrect ) throw new MyError('Email or password is not correct', 400);

    const token = user.getJsonWebToken(); // that method is written in user model

    const cookieOptions = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    res.status(200).cookie('bookstore-user-token', token, cookieOptions).json({
    // res.status(200).json({
        success: true,
        token,
        user: user
    }); 
});

exports.logoutUser = asyncHandler( async (req, res, next) => {
    const cookieOptions = {
        expires: new Date(Date.now() - 24 * 1000),
        httpOnly: true
    }

    res.status(200).cookie('bookstore-user-token', null, cookieOptions).json({
        success: true,
        data: 'Logged out.'
    });
} );

exports.getUsers = asyncHandler(async (req, res, next) => {
    const select = req.query.select;
    const sort = req.query.sort;
    const page = parseInt(req.query.page) || 1; // if page didn't come default page is 1
    const limit = parseInt(req.query.limit) || 5; // default documents in 1 page

    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    const pagination = await paginate(page, limit, User);

    const users = await User.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit);
    res.status(200).json({
        success: 'true', 
        count: users.length,
        data: users,
        pagination
    });
});

exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user){
        // throw new custom error
        throw new MyError('Hey there is no data with this id ' + req.params.id, 400);
    }
    res.status(200).json({
        success: true,
        data: user
    });
});

exports.createUser = asyncHandler( async (req, res, next) => {
    user = await User.create(req.body);
    res.status(200).json({
        success: 'true', 
        data: user
    });
});

exports.updateUser = asyncHandler( async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true // check validaters on models/User.js file
    });
    if(!user){ // when there is no ID, it returns null
        // throw custom error
        throw new MyError('There is no data with this id ' + req.params.id, 430);
    }
    res.status(200).json({
        success: 'true',
        data: user
    });
});

exports.deleteUser = asyncHandler( async (req, res, next) => {
    const user = await User.findById(req.params.id);

    // if category is null
    if(!user){
        // throw new custom error
        throw new MyError('There is no data with this id: ' + req.params.id, 400);
    }

    // used for deleting related books, code is written in category model
    user.remove();

    res.status(200).json({
        success: 'true',
        data: user
    })
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
    if( !req.body.email ) throw new MyError('You should input your email to get password recovery link', 400);
    const user = await User.findOne({email: req.body.email});

    if (!user) throw new MyError('Hey there is no email:  ' + req.params.email, 400);

    resetPasswordToken = user.generatePasswordChangeToken();
    user.save({ validateBeforeSave: false });

    // Send email
    const link = `http://www.bookstore.mn/forget-password/${resetPasswordToken}`;
    const message = `
        <div>
            Hello  <b> ${user.name} </b><br><br>
            You have requested password reset on ${user.email} mail address on our online bookstore. <br><br>
            Click link below to reset your password <br><br>
            <a target="_blank" href="${link}">${link}</a> <br><br>
            Have good day &#128536; .
        </div>
    `;
    await sendEmail({
        to: user.email,
        subject: 'This is password recovery email from online bookstore',
        message
    });

    res.status(200).json({
        success: true,
        resetPasswordToken,
        data: user
    });
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
    if( !req.body.resetToken || !req.body.password ) throw new MyError('You should pass token and password', 400);

    const encrypted = crypto.createHash('sha256').update(req.body.resetToken).digest('hex');

    const user = await User.findOne({ resetPasswordToken: encrypted, resetPasswordExpire: {$gt: Date.now()} });

    if (!user) throw new MyError('Token is not valid', 400);

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getJsonWebToken();

    res.status(200).json({
        success: true,
        token,
        data: user
    });
});