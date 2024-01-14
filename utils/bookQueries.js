function createAllBooksQuery({ category_id, news, limit, offset }) {
    let sql = "SELECT *, (SELECT count(*) FROM Bookshop.likes WHERE Bookshop.books.id = Bookshop.likes.liked_book_id) AS likes FROM books";
    let values = [];

    if (category_id && news) {
        sql += ` WHERE category_id=? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
        values = [category_id];
    } else if (category_id) {
        sql += ` WHERE category_id=?`;
        values = [category_id];
    } else if (news) {
        sql += ` WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()`;
    }

    if (limit) {
        sql += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);
    }

    return { sql, values };
}

function createBookDetailQuery({ user_id, book_id }) {
    let sql = `SELECT *,
                   (SELECT count(*) FROM Bookshop.likes WHERE liked_book_id = books.id) AS likes,
                   (SELECT EXISTS (SELECT 1 FROM Bookshop.likes WHERE likes.user_id = ? AND likes.liked_book_id = ?)) AS liked
               FROM Bookshop.books
               LEFT JOIN Bookshop.category
               ON books.category_id = category.category_id
               WHERE books.id = ?`;
    let values = [user_id, book_id, book_id];

    return { sql, values };
}

module.exports = {
    createAllBooksQuery,
    createBookDetailQuery
};
