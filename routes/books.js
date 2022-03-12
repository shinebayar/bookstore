const express = require('express');

const { protect, authorize } = require('../middleware/protectEndpoint');

const {getBooks, getBook, createBook, deleteBook, updateBook, uploadBookPhoto} = require('../controller/books');

const router = express.Router();
                                    // run first protect middleware. Then run second authorize middleware. Then run createBook middleware
router.route('/').get(getBooks).post(protect, authorize('admin', 'operator'), createBook);
router.route('/:id').get(getBook).delete(protect, authorize('admin', 'operator'), deleteBook).put(protect, authorize('admin', 'operator'), updateBook);
router.route('/:id/photo').put(protect, authorize('admin', 'operator'), uploadBookPhoto);

module.exports = router;