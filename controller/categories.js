const Category = require('../models/Category');
const MyError = require('../utils/myError');
const asyncHandler = require('../middleware/asyncHandler');

exports.getCategories = asyncHandler(async (req, res, next) => {
    console.log(req.query);
    // const categories = await Category.find(req.query, 'name description');
    const select = req.query.select;
    const sort = req.query.sort;
    delete req.query.select;
    delete req.query.sort;
    console.log('req.query: ', req.query);
    console.log('select: ', select);
    console.log('sort: ', sort);
    const categories = await Category.find(req.query, select).sort(sort);
    res.status(200).json({
        success: 'true', 
        data: categories
    });
});

exports.getCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
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
    const category = await Category.findByIdAndDelete(req.params.id);

    // if category is null
    if(!category){
        // throw new custom error
        throw new MyError('There is no data with this id: ' + req.params.id, 400);
    }
    res.status(200).json({
        success: 'true',
        data: category
    })
});