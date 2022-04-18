const express = require('express');

const { protect, authorize } = require('../middleware/protectEndpoint');

const {getCategories, getCategory, createCategory, updateCategory, deleteCategory, uploadCategoryPhoto} = require('../controller/categories');

const router = express.Router();

router.route('/').get(getCategories).post(protect, authorize('admin', 'operator'), createCategory);
router.route('/:id').get(getCategory).put(protect, authorize('admin', 'operator'), updateCategory).delete(protect, authorize('admin', 'operator'), deleteCategory);
router.route('/:id/photo').put(protect, authorize('admin', 'operator'), uploadCategoryPhoto);

// call book controller
const {getBooksByCategory} = require('../controller/books');
router.route('/:categoryId/books').get(getBooksByCategory);

// call book router
// const bookRouter = require('./books');
// router.use('/:categoryId/books', bookRouter);


module.exports = router;