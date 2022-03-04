const Category = require('../models/Category');
const MyError = require('../utils/myError');
const asyncHandler = require('../middleware/asyncHandler');

exports.getCategories = asyncHandler(async (req, res, next) => {
    console.log(req.query);
    const select = req.query.select;
    const sort = req.query.sort;
    const page = parseInt(req.query.page) || 1; // if page didn't come default page is 1
    const limit = parseInt(req.query.limit) || 5; // default documents in 1 page

    ['select', 'sort', 'page', 'limit'].forEach(el => delete req.query[el]);

    // Pagination
    const total = await Category.countDocuments();
    const pageCount = Math.ceil(total / limit);
    const start = (page - 1) * limit + 1;
    let end = start + limit -1;
    if(end > total) end = total;
    
    const pagination = {total, pageCount, start, end, limit};

    if(page < pageCount) pagination.nextPage = page + 1;
    if(page > 1) pagination.previousPage = page - 1;

    console.log('req.query: ', req.query);
    // console.log('select: ', select);
    // console.log('sort: ', sort);

    const categories = await Category.find(req.query, select).sort(sort).skip(start - 1).limit(limit);
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