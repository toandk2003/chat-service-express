// routes/helloRoutes.js
const express = require('express');
const router = express.Router();
const helloController = require('../controller/TestController');

// GET /helloworld
router.get('/helloworld', helloController.getHelloWorld);

// POST /helloworld  
router.post('/helloworld', helloController.postHelloWorld);

module.exports = router;