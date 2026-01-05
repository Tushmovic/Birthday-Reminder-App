const express = require('express');
const router = express.Router();
const { createUser, getUsers, validateUser } = require('../controllers/userController');

router.post('/', validateUser, createUser);
router.get('/', getUsers);

module.exports = router;