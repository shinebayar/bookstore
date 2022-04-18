const asyncHandler = require("./asyncHandler");
const jwt = require('jsonwebtoken');
const MyError = require('../utils/myError');
const User = require('../models/User');

exports.protect = asyncHandler( async(req, res, next) => {
    let token = null;

    if( req.headers.authorization ) {
        token = req.headers.authorization.split(' ')[1];
    } else if( req.cookies ){
        token = req.cookies['bookstore-user-token'];
    }
    
    if( !token ) {
        throw new MyError('You should be authorized to access. Check "Authorization Header OR There is no token"', 401);
    }


    const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('encoded jwt', tokenObj);

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