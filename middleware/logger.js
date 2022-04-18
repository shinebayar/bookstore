const logger = (req, res, next) =>{

    console.log('------------------ cookies: ', req.cookies);

    console.log(`${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`);
    next();
}

module.exports = logger;