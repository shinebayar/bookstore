const Book = require('../models/Books');
const MyError = require('../utils/myError');
const asyncHandler = require('../middleware/asyncHandler');

// api/v1/books
// api/v1/categories/:catId/books
exports.getBooks = asyncHandler( async(req, res, next) =>{
    let query;
    if(req.params.categoryId){
        query = Book.find({category: req.params.categoryId})
    }else{
        query = Book.find();
    }
    const books = await query;
    res.status(200).json({
        success: true,
        count: books.length,
        data: books
    });
} );