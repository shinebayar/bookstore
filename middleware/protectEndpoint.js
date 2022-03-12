const asyncHandler = require("./asyncHandler");
const jwt = require('jsonwebtoken');
const MyError = require('../utils/myError');
const User = require('../models/User');

exports.protect = asyncHandler( async(req, res, next) => {
    if( !req.headers.authorization ) throw new MyError('You should be authorized to access. Check "Authorization Header"', 401);

    const token = req.headers.authorization.split(' ')[1];

    if( !token ) throw new MyError('There is no token', 400);

    const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
    console.log('encoded jwt', tokenObj);

    req.userId = tokenObj.id;
    req.role = tokenObj.role;
    next();
} );

exports.authorize = (...role) => {
    return (req, res, next) => {
        if(!role.includes(req.role)) throw new MyError(`Your role is ${req.role} It is not permitted to do that operation.`, 403);
        next();
    }
}