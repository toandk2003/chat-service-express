// routes/helloRoutes.js
const express = require('express');
const router = express.Router();
const synchronizeController = require('../controller/SynchronizeController');

router.post('/synchronize/conversations/private', synchronizeController.syncConversationPrivate);
router.post('/synchronize/conversations/bot', synchronizeController.syncConversationBot);

module.exports = router;