const path = require('path');

const Category = require('../models/Category');
const MyError = require('../utils/myError');
const asyncHandler = require('../middleware/asyncHandler');
const paginate = require('../utils/paginate');

exports.getCategories = asyncHandler(async (req, res, next) => {
    // console.log(req.query);
    const select = req.query.select;
    const sort = req.query.sort;
    const page = parseInt(req.query.page) || 1; // if page didn't come default page is 1
    const limit = parseInt(req.query.limit) || 5; // default documents in 1 page

    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    const pagination = await paginate(page, limit, Category);

    // console.log('req.query: ', req.query);
    // console.log('select: ', select);
    // console.log('sort: ', sort);

    const categories = await Category.find(req.query, select).sort(sort).skip(pagination.start - 1).limit(limit);
    res.status(200).json({
        success: 'true', 
        count: categories.length,
        data: categories,
        pagination
    });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id).populate('books');
    if (!category){
        // throw new custom error
        throw new MyError('Hey there is no data with this id ' + req.params.id, 400);
    }
    res.status(200).json({
        success: true,
        data: category
    });
});

exports.createCategory = asyncHandler( async (req, res, next) => {
    category = await Category.create(req.body);
    res.status(200).json({
        success: 'true', 
        data: category
    });
});

exports.updateCategory = asyncHandler( async (req, res, next) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true // check validaters on models/Category.js file
    });
    if(!category){ // when there is no ID, it returns null
        // throw custom error
        throw new MyError('There is no data with this id ' + req.params.id, 430);
    }
    res.status(200).json({
        success: 'true',
        data: category
    });
});

exports.deleteCategory = asyncHandler( async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    // if category is null
    if(!category){
        // throw new custom error
        throw new MyError('There is no data with this id: ' + req.params.id, 400);
    }

    // used for deleting related books, code is written in category model
    category.remove();

    res.status(200).json({
        success: 'true',
        data: category
    })
});

exports.uploadCategoryPhoto = asyncHandler( async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    
    const photo = req.files.photo;

    if( ! photo.mimetype.startsWith('image') ) throw new MyError('Upload file must be image', 400);
    
    if( photo.size > process.env.MAX_UPLOAD_FILE_SIZE ) throw new MyError(`Upload image size is exceeded. It should be less than ${process.env.MAX_UPLOAD_FILE_SIZE} byte`, 400)

    const photoName = `photo_${category._id}${path.parse(photo.name).ext}`;

    photo.mv(`${process.env.UPLOAD_PHOTO_ROOT_PATH_CATEGORY}/${photoName}`);

    category.photo = photoName;
    category.save();

    res.status(200).json({
        success: true,
        data: category
    });
} );