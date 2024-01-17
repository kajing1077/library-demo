const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const ensureAuthorization = require('../auth');
const jwt = require("jsonwebtoken");
const { createBookDetailQuery } = require('../utils/bookQueries');


const allBooks = (req, res) => {
    let allBooksRes = {};
    let { category_id, news, limit, currentPage } = req.query;
    let offset = limit * (currentPage - 1);

    let sql = "SELECT SQL_CALC_FOUND_ROWS *, (SELECT count(*) FROM Bookshop.likes WHERE Bookshop.books.id = Bookshop.likes.liked_book_id) AS likes FROM books";
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

    sql += " LIMIT ? OFFSET ?";
    values.push(parseInt(limit), offset);

    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if (results.length) {
                results.map(function (result) {
                    result.pubDate = result.pub_date;
                    delete result.pub_date;
                });
                allBooksRes.books = results;
            } else {
                return res.status(StatusCodes.NOT_FOUND).end();
            }

            sql = "SELECT found_rows()";

            conn.query(sql,
                (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(StatusCodes.BAD_REQUEST).end();
                    }

                    let pagination = {};
                    pagination.currentPage = parseInt(currentPage);
                    pagination.totalCount = results[0]["found_rows()"];

                    allBooksRes.pagination = pagination;

                    return res.status(StatusCodes.OK).json(allBooksRes);
                });
        });
};



const bookDetail = (req, res) => {
    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else if (authorization instanceof ReferenceError) {
        let book_id = req.params.id;
        let { sql, values } = createBookDetailQuery({ user_id: null, book_id, is_logged_in: false });

        conn.query(sql, values, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            handleQueryResult(res, results);
        });
    } else {
        let book_id = parseInt(req.params.id);
        let { sql, values } = createBookDetailQuery({ user_id: authorization.id, book_id, is_logged_in: true });

        conn.query(sql, values, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            handleQueryResult(res, results);
        });
    }
};

const handleQueryResult = (res, results) => {
    if (results[0]) {
        res.status(StatusCodes.OK).json(results[0]);
    } else {
        res.status(StatusCodes.NOT_FOUND).end();
    }
};

module.exports = {
    allBooks,
    bookDetail,
};


