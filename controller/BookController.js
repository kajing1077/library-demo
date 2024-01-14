const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const allBooks = (req, res) => {
    let { category_id, news, limit, currentPage } = req.query;
    let offset = 0;

    if (limit && currentPage) {
        limit = parseInt(limit);
        currentPage = parseInt(currentPage);
        offset = limit * (currentPage - 1);
    }

    let sql = "SELECT *, (SELECT count(*) FROM Bookshop.likes WHERE Bookshop.books.id = Bookshop.likes.liked_book_id) AS likes FROM books";
    let values = [];

    if (category_id && news) {
        sql += ` WHERE category_id=? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW();`;
        values = [category_id];
    } else if (category_id) {
        sql += ` WHERE category_id=?`;
        values = [category_id];
    } else if (news) {
        sql += ` WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW();`;
    }

    if (limit && currentPage) {
        sql += ` LIMIT ? OFFSET ?`;
        values.push(limit, offset);
    }

    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }

        if (results.length) {
            return res.status(StatusCodes.OK).json(results);
        } else {
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    });
}
const bookDetail = (req, res) => {
    let { user_id } = req.body;
    let book_id = parseInt(req.params.id);

    let sql = `SELECT *,
                      (SELECT count(*) FROM Bookshop.likes WHERE liked_book_id = books.id) AS likes,
                      (SELECT EXISTS (SELECT 1 FROM Bookshop.likes WHERE likes.user_id = ? AND likes.liked_book_id = ?)) AS liked
                    FROM Bookshop.books
                    LEFT JOIN Bookshop.category
                    ON books.category_id = category.category_id
                    WHERE books.id = ?`;
    let values = [user_id, book_id, book_id];
    conn.query(sql, values, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        if (results[0]) {
            res.status(StatusCodes.OK).json(results[0]);
        } else {
            return res.status(StatusCodes.NOT_FOUND).end();
        }
    })
}


module.exports = {
    allBooks,
    bookDetail,
};


