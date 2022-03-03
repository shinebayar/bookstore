const errorHandler = (err, req, res, next) => {
    console.log(err.stack.red);
    console.log('=================');
    console.log(err.name);

    if(err.name === 'CastError'){ 
        err.message = 'This is not valid ID structure';
        err.statusCode = 400;
    }

    if(err.name === 'ValidationError'){ 
        err.message = 'You should fill required fields';
        err.statusCode = 400;
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: err
    });
}

module.exports = errorHandler;