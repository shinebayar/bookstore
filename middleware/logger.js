const logger = (req, res, next) =>{
    req.userId = 'asdfasdfwefwqfwfqw';
    console.log(`${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`);
    next();
}

module.exports = logger;