const express = require('express');
const { getAllBooks, getBookDetail, searchBooks, addFavoriteBook, deleteFavoriteBook, getFavoriteBook, getReviewByBookId, addReviewByBookId, updateReviewByUser, deleteReviewByUser } = require('../controllers/book.controller');

const router = express.Router();

router.get('/', getAllBooks)
router.get('/search', searchBooks)
router.get('/:bookId', getBookDetail)
router.post('/favorite', addFavoriteBook)
router.delete('/favorite', deleteFavoriteBook)
router.get('/favorite/:userId', getFavoriteBook)
router.get('/review/:bookId', getReviewByBookId)
router.post('/review/:bookId/:userId', addReviewByBookId)
router.put('/review/:bookId/:userId/:reviewId', updateReviewByUser)
router.delete('/review/:bookId/:userId/:reviewId', deleteReviewByUser)



module.exports = router;