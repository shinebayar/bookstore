const Book = require('../models/Books');
const Category = require('../models/Category');
const MyError = require('../utils/myError');
const asyncHandler = require('../middleware/asyncHandler');

// api/v1/books
// api/v1/categories/:catId/books
exports.getBooks = asyncHandler( async(req, res, next) =>{
    let query;
    if(req.params.categoryId){
        query = Book.find({category: req.params.categoryId})
    }else{
        query = Book.find().populate({
            path: 'category',
            select: 'name description averagePrice'
        });
    }
    const books = await query;
    res.status(200).json({
        success: true,
        count: books.length,
        data: books
    });
} );

exports.getBook = asyncHandler( async(req, res, next) =>{
    const book = await Book.findById(req.params.id);
    if(!book){
        throw new MyError('There is no data with ' + req.params.id + ' id', 404);
    }
    const avg = await Book.computeCategoryAveragePrice(book.category);
    res.status(200).json({
        success: true,
        data: book,
        avgPriceInCategory: avg
    });
} );

exports.createBook = asyncHandler( async(req, res, next) =>{
    const category = await Category.findById(req.body.category);
    if(!category){
        throw new MyError('There is no category data with ' + req.body.category + ' id', 404);
    }
    const book = await Book.create(req.body);
    res.status(200).json({
        success: true,
        data: book
    });
} );

exports.updateBook = asyncHandler( async (req, res, next) => {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true // check validaters on models/Book.js file
    });
    if(!book){ // when there is no ID, it returns null
        // throw custom error
        throw new MyError('There is no data with this id ' + req.params.id, 430);
    }
    res.status(200).json({
        success: 'true',
        data: book
    });
});

exports.deleteBook = asyncHandler( async(req, res, next) =>{
    const book = await Book.findById(req.params.id);
    if(!book){
        throw new MyError('There is no data with id ' + req.params.id, 404);
    }

    // this below code can give a chance to delete related comments to that book
    book.remove();
    res.status(200).json({
        success: true,
        data: book
    });
} );