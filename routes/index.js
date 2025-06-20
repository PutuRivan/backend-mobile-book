const express = require('express');
const authRoutes = require('./auth.route');
const bookRoutes = require('./book.route');
const router = express.Router();

router.use('/auth', authRoutes)
router.use('/book', bookRoutes)

module.exports = router;