async function getAllBooks(req, res) {
  try {
    const response = await fetch(
      'https://www.googleapis.com/books/v1/volumes?q=subject:fiction&orderBy=relevance&maxResults=10'
    ).then((res) => res.json());

    // console.log(response);
    const books = (response.items || []).map((item) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
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
        authors: book.volumeInfo.authors,
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

    console.log(response);
    const books = response.items.map((item) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || [],
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


module.exports = {
  getAllBooks,
  getBookDetail,
  searchBooks
};
