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

const orderQueries = {
    insertNewDeliveryInfo: `INSERT INTO Bookshop.delivery (address, receiver, contact)
                            VALUES (?, ?, ?)`,

    insertNewOrder: `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id)
                     VALUES (?, ?, ?, ?, ?)`,

    selectCartItemsForOrder: `SELECT book_id, quantity
                              FROM cartItems
                              WHERE id IN (?)`,

    insertOrderedBooks: `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?`,

    removeAllSelectedCartItems: `DELETE
                                  FROM cartItems
                                  WHERE id IN (?)`,

    fetchOrderById: `SELECT book_id, title, author, price, quantity
                            FROM orderedBook
                                 LEFT JOIN books ON orderedBook.book_id = books.id
                            WHERE order_id = ?`,

    fetchOrdersByUserId: `SELECT orders.id,
                                created_at,
                                address,
                                receiver,
                                contact,
                                book_title,
                                total_quantity,
                                total_price
                         FROM orders
                              LEFT JOIN delivery
                                    ON orders.delivery_id = delivery.id
                         WHERE user_id = ?`,

    fetchOrderDetailsByIdAndUserId: `SELECT book_id, title, author, price, quantity
                   FROM orderedBook
                            LEFT JOIN books ON orderedBook.book_id = books.id
                   WHERE order_id = ?`,
};


module.exports = { userQueries, categoryQueries, cartQueries, likeQueries, orderQueries };

