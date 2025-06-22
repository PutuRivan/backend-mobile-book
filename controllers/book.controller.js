const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function getAllBooks(req, res) {
  try {
    const response = await fetch(
      'https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults=10'
    ).then((res) => res.json());

    // console.log(response);
    const books = (response.items || []).map((item) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors[0],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
      description: item.volumeInfo.description || null,
      genre: item.volumeInfo.categories || [],
      rating: item.volumeInfo.averageRating || 0,
    }));

    res.status(200).json({ success: true, books });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil buku populer',
      error: err.message,
    });
  }
}

async function getBookDetail(req, res) {
  try {
    const { bookId } = req.params;

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${bookId}`
    ).then((res) => res.json());
    const book = response;

    res.status(200).json({
      success: true,
      book: {
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors[0],
        description: book.volumeInfo.description,
        thumbnail: book.volumeInfo.imageLinks?.thumbnail,
        genre: book.volumeInfo.categories,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail buku',
      error: err.message,
    });
  }
}

async function searchBooks(req, res) {
  try {
    const { q } = req.query;
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`
    ).then((res) => res.json());

    // console.log(response);
    const books = response.items.map((item) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors[0],
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
      description: item.volumeInfo.description || null,
      genre: item.volumeInfo.categories || [],
    }));

    res.status(200).json({ success: true, books });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data buku',
      error: err.message,
    });
  }
}

async function addFavoriteBook(req, res) {
  const { userId, bookId, title, authors, thumbnail, description } = req.body;

  try {
    // Cek apakah favorite sudah ada
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId
        }
      }
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Book is already in favorites.' });
    }

    // Handle jika authors, thumbnail, description null/undefined
    const safeAuthors = authors ?? 'Unknown Author';
    const safeThumbnail = thumbnail ?? 'https://via.placeholder.com/150'; // placeholder gambar default
    const safeDescription = description ?? 'No description available.';

    // Cek apakah Book sudah ada
    let book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    // Jika belum ada di DB, insert baru
    if (!book) {
      book = await prisma.book.create({
        data: {
          id: bookId,
          title: title,
          authors: safeAuthors,
          thumbnail: safeThumbnail,
          description: safeDescription,
          createdAt: new Date() // sudah sesuai schema kamu
        }
      });
    }

    // Buat Favorite baru
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        bookId
      }
    });

    res.status(200).json({ message: 'Book added to favorites!', favorite });
  } catch (error) {
    console.error('Error adding to favorite:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getFavoriteBook(req, res) {
  const { userId } = req.params;

  try {
    // Ambil semua Favorite berdasarkan userId
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { // include relasi Book
        book: true
      }
    });

    // Format hasil agar langsung mengembalikan data Book saja
    const favoriteBooks = favorites.map(fav => fav.book);

    res.status(200).json({ message: "Get favorite book successfully", data: favoriteBooks });
  } catch (error) {
    console.error('Error fetching favorite books:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteFavoriteBook(req, res) {
  const { userId, bookId } = req.body; // bisa juga dari req.params kalau mau

  try {
    // Cek apakah favorite ini ada
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_bookId: { // sesuai @@unique([userId, bookId])
          userId: userId,
          bookId: bookId
        }
      }
    });

    if (!existingFavorite) {
      return res.status(404).json({ message: 'Favorite book not found.' });
    }

    // Hapus favorite
    await prisma.favorite.delete({
      where: {
        userId_bookId: {
          userId: userId,
          bookId: bookId
        }
      }
    });

    res.status(200).json({ message: 'Book removed from favorites.' });
  } catch (error) {
    console.error('Error deleting favorite book:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getReviewByBookId(req, res) {
  try {
    const { bookId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        bookId: bookId
      },
      include: {
        user: true
      }
    });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data review',
      error: error.message,
    });
  }
}

async function addReviewByBookId(req, res) {
  try {
    const { bookId, userId } = req.params;
    const { title, authors, thumbnail, description, comment } = req.body;

    // Handle jika authors, thumbnail, description null/undefined
    const safeAuthors = authors ?? 'Unknown Author';
    const safeThumbnail = thumbnail ?? 'https://via.placeholder.com/150'; // placeholder gambar default
    const safeDescription = description ?? 'No description available.';

    // Cek apakah Book sudah ada
    let book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    // Jika belum ada di DB, insert baru
    if (!book) {
      book = await prisma.book.create({
        data: {
          id: bookId,
          title: title,
          authors: safeAuthors,
          thumbnail: safeThumbnail,
          description: safeDescription,
          createdAt: new Date() // sudah sesuai schema kamu
        }
      });
    }

    const newReview = await prisma.review.create({
      data: {
        userId: userId,
        bookId: bookId,
        comment: comment,
        createdAt: new Date() // sudah sesuai schema kamu
      }
    });

    res.status(200).json({ success: true, data: newReview });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan review',
      error: error.message,
    })
  }
}

async function updateReviewByUser(req, res) {
  try {
    const { reviewId, bookId, userId } = req.params;
    const { comment } = req.body;

    const updatedReview = await prisma.review.update({
      where: {
        id: reviewId,
        userId: userId,
        bookId: bookId
      },
      data: {
        comment: comment
      }
    });

    res.status(200).json({
      message: 'Review updated successfully',
      data: updatedReview
    })
  } catch (error) {
    res.status(500).json({
      message: "Gagal Update Review",
      error: error.message
    })
  }
}


async function deleteReviewByUser(req, res) {
  try {
    const { reviewId, bookId, userId } = req.params;

    const deletedReview = await prisma.review.delete({
      where: {
        id: reviewId,
        userId: userId,
        bookId: bookId
      }
    });

    res.status(200).json({
      message: 'Review deleted successfully',
      data: deletedReview
    })
  } catch (error) {
    res.status(500).json({
      message: "Gagal Menghapus Review",
      error
    })
  }
}
module.exports = {
  getAllBooks,
  getBookDetail,
  searchBooks,
  addFavoriteBook,
  deleteFavoriteBook,
  getFavoriteBook,
  getReviewByBookId,
  addReviewByBookId,
  updateReviewByUser,
  deleteReviewByUser
};
