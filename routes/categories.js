const express = require('express');
const { del } = require('express/lib/application');

const {getCategories, getCategory, createCategory, updateCategory, deleteCategory} = require('../controller/categories');

const router = express.Router();

router.route('/').get(getCategories).post(createCategory);
router.route('/:id').get(getCategory).put(updateCategory).delete(deleteCategory);


module.exports = router;