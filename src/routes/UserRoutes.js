// routes/helloRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');

// POST /helloworld  
router.post('/users', userController.create);

module.exports = router;