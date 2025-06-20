const express = require('express');
const { getAllBooks, getBookDetail, searchBooks } = require('../controllers/book.controller');

const router = express.Router();

router.get('/', getAllBooks)
router.get('/search', searchBooks)
router.get('/:bookId', getBookDetail)

module.exports = router;