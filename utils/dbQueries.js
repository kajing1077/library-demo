const userQueries = {
    insertUser: `INSERT INTO Bookshop.users (email, password, salt) VALUES (?, ?, ?)`,
    selectUserByEmail: `SELECT * FROM Bookshop.users WHERE email = ?`,
    updateUserPassword: `UPDATE Bookshop.users SET password=?, salt=? WHERE email = ?`
};

const categoryQueries = {
    selectAllCategories: `SELECT * FROM Bookshop.category`
};

const cartQueries = {
    insertCartItem: `INSERT INTO Bookshop.cartItems (book_id, quantity, user_id)
                     VALUES (?, ?, ?);`,

    selectCartItemsByUser: `SELECT cartItems.id, book_id, title, summary, quantity, price
                            FROM cartItems
                                 LEFT JOIN books ON cartItems.book_id = books.id
                            WHERE user_id = ?
                              AND cartItems.id IN (?);`,

    deleteCartItemById: `DELETE
                         FROM Bookshop.cartItems
                         WHERE id = ?;`
};

const likeQueries = {
    insertLikeForBook: `INSERT INTO Bookshop.likes (user_id, liked_book_id)
                        VALUES (?, ?);`,

    deleteLikeForBook: `DELETE
                        FROM Bookshop.likes
                        WHERE user_id = ?
                          AND liked_book_id = ?;`
};

module.exports = { userQueries, categoryQueries, cartQueries, likeQueries };

