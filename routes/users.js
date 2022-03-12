const express = require('express');

const { protect, authorize } = require('../middleware/protectEndpoint');

const {registerUser, loginUser, getUsers, getUser, createUser, updateUser, deleteUser} = require('../controller/users');
const { getUserBooks } = require('../controller/books');

const router = express.Router();

router.route('/login').post(loginUser);
router.route('/register').post(registerUser);

// Above routes use protect middleware.
router.use(protect);
router.route('/').get(authorize('admin'), getUsers).post(authorize('admin'), createUser);
router.route('/:id').get(authorize('admin', 'operator'), getUser).put(authorize('admin'), updateUser).delete(authorize('admin'), deleteUser);
router.route('/:id/books').get(authorize('admin', 'operator', 'user'), getUserBooks);

module.exports = router;