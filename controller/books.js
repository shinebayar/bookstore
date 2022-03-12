const path = require('path');

const Book = require('../models/Books');
const Category = require('../models/Category');
const User = require('../models/User');
const MyError = require('../utils/myError');
const asyncHandler = require('../middleware/asyncHandler');
const paginate = require('../utils/paginate');

// api/v1/books
exports.getBooks = asyncHandler( async(req, res, next) =>{
    const select = req.query.select;
    const sort = req.query.sort;
    const page = parseInt(req.query.page) || 1; // if page didn't come default page is 1
    const limit = parseInt(req.query.limit) || 5; // default documents in 1 page

    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    const pagination = await paginate(page, limit, Book);

    const books = await Book.find(req.query, select).populate({
        path: 'category',
        select: 'name description averagePrice'
    }).sort(sort).skip(pagination.start - 1).limit(limit);
    res.status(200).json({
        success: true,
        count: books.length,
        data: books,
        pagination
    });
} );

exports.getUserBooks = asyncHandler( async(req, res, next) =>{
    const select = req.query.select;
    const sort = req.query.sort;
    const page = parseInt(req.query.page) || 1; // if page didn't come default page is 1
    const limit = parseInt(req.query.limit) || 5; // default documents in 1 page

    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    const pagination = await paginate(page, limit, Book);

    req.query.createdUser = req.params.id;
    console.log('req.query: ', req.query);
    console.log('req.userId: ', req.userId);
    // console.log(req)

    const books = await Book.find(req.query, select).populate({
        path: 'category',
        select: 'name description averagePrice'
    }).sort(sort).skip(pagination.start - 1).limit(limit);
    res.status(200).json({
        success: true,
        count: books.length,
        data: books,
        pagination
    });
} );

// api/v1/categories/:catId/books
exports.getBooksByCategory = asyncHandler( async(req, res, next) =>{
    const select = req.query.select;
    const sort = req.query.sort;
    const page = parseInt(req.query.page) || 1; // if page didn't come default page is 1
    const limit = parseInt(req.query.limit) || 5; // default documents in 1 page

    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    const pagination = await paginate(page, limit, Book);

    const books = await Book.find({...req.query, category: req.params.categoryId}, select).sort(sort).skip(pagination.start - 1).limit(limit);
    res.status(200).json({
        success: true,
        count: books.length,
        data: books,
        pagination
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

    // this data come from middleware
    req.body.createdUser = req.userId;
    
    const book = await Book.create(req.body);
    res.status(200).json({
        success: true,
        data: book
    });
} );

exports.updateBook = asyncHandler( async (req, res, next) => {
    // this data come from middleware
    req.body.updatedUser = req.userId;

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

    const user = await User.findById(req.userId);

    res.status(200).json({
        success: true,
        deleteUser: user.name,
        data: book
    });
} );

exports.uploadBookPhoto = asyncHandler( async (req, res, next) => {
    const book = await Book.findById(req.params.id, req.body, {});
    if(!book){ // when there is no ID, it returns null
        // throw custom error
        throw new MyError('There is no data with this id ' + req.params.id, 400);
    }

    const photo = req.files.photo;

    if( ! photo.mimetype.startsWith('image') ) throw new MyError('Upload file must be image', 400);

    if( photo.size > process.env.MAX_UPLOAD_FILE_SIZE ) throw new MyError('Max upload size is exceeded. Max size is 5mb.', 400);

    const photoName = `photo_${book._id}${path.parse(photo.name).ext}`;

    photo.mv(`${process.env.UPLOAD_PHOTO_ROOT_PATH_BOOK}/${photoName}`, err => {
        if(err) throw new MyError('There is error while uploading. Error: ' + err.message, 400);
    });

    book.cover_photo = photoName;
    book.save();

    res.status(200).json({
        success: 'true',
        data: book
    });
});