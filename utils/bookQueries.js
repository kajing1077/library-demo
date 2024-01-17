function createBookDetailQuery({ user_id, book_id, is_logged_in }) {
    let sql = `SELECT *,
                      (SELECT count(*) FROM Bookshop.likes WHERE liked_book_id = books.id) AS likes`;

    if (is_logged_in) {
        sql += `, (SELECT EXISTS (SELECT 1 FROM Bookshop.likes WHERE likes.user_id = ? AND likes.liked_book_id = ?)) AS liked`;
    }

    sql += `
              FROM Bookshop.books
              LEFT JOIN Bookshop.category
              ON books.category_id = category.category_id
              WHERE books.id = ?`;

    let values = [book_id];

    if (is_logged_in) {
        values.push(user_id, book_id);
    }

    return { sql, values };
}

module.exports = {
    createBookDetailQuery
};
