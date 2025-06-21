const express = require('express');
const { getAllBooks, getBookDetail, searchBooks, addFavoriteBook, deleteFavoriteBook, getFavoriteBook } = require('../controllers/book.controller');

const router = express.Router();

router.get('/', getAllBooks)
router.get('/search', searchBooks)
router.get('/:bookId', getBookDetail)
router.post('/favorite', addFavoriteBook)
router.delete('/favorite', deleteFavoriteBook)
router.get('/favorite/:userId', getFavoriteBook)

module.exports = router;