const errorHandler = (err, req, res, next) => {
    console.log(err.stack.cyan.underline);
  
    const error = { ...err };
  
    error.message = err.message;
  
    if (error.name === "CastError") {
      error.message = "This id is not correct format.";
      error.statusCode = 400;
    }
  
    if (error.code === 11000) {
      error.message = "That field is must be unique!";
      error.statusCode = 400;
    }
  
    res.status(err.statusCode || 500).json({
      success: false,
      error,
    });
  };
  
  module.exports = errorHandler;
  