const path = require('path');

const User = require('../models/User');
const MyError = require('../utils/myError');
const asyncHandler = require('../middleware/asyncHandler');
const paginate = require('../utils/paginate');

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

    res.status(200).json({
        success: true,
        token: user.getJsonWebToken(), // that method is written in user model
        user: user
    });
});

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