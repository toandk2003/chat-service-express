// routes/helloRoutes.js
const express = require('express');
const conversationRoutes = express.Router();

// GET /helloworld
conversationRoutes.get('/helloworld', helloController.getHelloWorld);

// POST /helloworld  
conversationRoutes.post('/helloworld', helloController.postHelloWorld);

module.exports = conversationRoutes;