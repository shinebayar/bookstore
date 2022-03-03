const express = require('express');

const {getCategories, getCategory, createCategory, updateCategory, deleteCategory} = require('../controller/categories');

const router = express.Router();

router.route('/').get(getCategories).post(createCategory);
router.route('/:id').get(getCategory).put(updateCategory).delete(deleteCategory);

// // call book controller
// const {getBooks} = require('../controller/books');
// router.route('/:categoryId/books').get(getBooks);

// call book router
const bookRouter = require('./books');
router.use('/:categoryId/books', bookRouter);


module.exports = router;