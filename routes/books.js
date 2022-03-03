const express = require('express');

const {getBooks} = require('../controller/books');

const router = express.Router({mergeParams: true});

router.route('/').get(getBooks);

module.exports = router;