const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const { createAllBooksQuery, createBookDetailQuery } = require("../utils/bookQueries");

const allBooks = (req, res) => {
    let { category_id, news, limit, currentPage } = req.query;
    let offset = 0;

    if (limit && currentPage) {
        limit = parseInt(limit);
        currentPage = parseInt(currentPage);
        offset = limit * (currentPage - 1);
    }

    const { sql, values } = createAllBooksQuery({ category_id, news, limit, offset });

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

    const { sql, values } = createBookDetailQuery({ user_id, book_id });

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


