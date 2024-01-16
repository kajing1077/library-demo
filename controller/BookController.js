const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const ensureAuthorization = require('../auth');
const jwt = require("jsonwebtoken");
const { handleDatabaseError } = require("../utils/errorHandler");
const { sendResponse } = require("../utils/responseHandler");

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
                return handleDatabaseError(err, res);
            }

            if (results.length) {
                results.map(function (result) {
                    result.pubDate = result.pub_date;
                    delete result.pub_date;
                });
                allBooksRes.books = results;
            } else {
                return sendResponse(res, StatusCodes.NOT_FOUND);
            }
        });

    sql = "SELECT found_rows()";

    conn.query(sql,
        (err, results) => {
            if (err) {
                console.log(err);
                return handleDatabaseError(err, res);
            }

            let pagination = {};
            pagination.currentPage = parseInt(currentPage);
            pagination.totalCount = results[0]["found_rows()"];

            allBooksRes.pagination = pagination;

            return sendResponse(res, StatusCodes.OK, allBooksRes);

        });
}


const bookDetail = (req, res) => {
    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return sendResponse(res, StatusCodes.UNAUTHORIZED, { 'message': '로그인 세션이 만료되었습니다.' });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return sendResponse(res, StatusCodes.BAD_REQUEST, { 'message': '잘못된 토큰입니다.' });
    } else if (authorization instanceof ReferenceError) {
        let book_id = req.params.id;
        let sql = `SELECT *,
                          (SELECT count(*) FROM Bookshop.likes WHERE liked_book_id = books.id) AS likes
                   FROM Bookshop.books
                            LEFT JOIN Bookshop.category
                                      ON books.category_id = category.category_id
                   WHERE books.id = ?`;
        let values = [book_id];
        conn.query(sql, values, (err, results) => {
            if (err) {
                console.log(err);
                return handleDatabaseError(err, res);
            }
            if (results[0]) {
                return sendResponse(res, StatusCodes.OK, results[0]);
            } else {
                return sendResponse(res, StatusCodes.NOT_FOUND);
            }
        })
    } else {// 로그인 상태
        let book_id = parseInt(req.params.id);

        let sql = `SELECT *,
                          (SELECT count(*) FROM Bookshop.likes WHERE liked_book_id = books.id) AS likes,
                          (SELECT EXISTS (SELECT 1
                                          FROM Bookshop.likes
                                          WHERE likes.user_id = ?
                                            AND likes.liked_book_id = ?))                      AS liked
                   FROM Bookshop.books
                            LEFT JOIN Bookshop.category
                                      ON books.category_id = category.category_id
                   WHERE books.id = ?`;
        let values = [authorization.id, book_id, book_id];
        conn.query(sql, values, (err, results) => {
            if (err) {
                console.log(err);
                return handleDatabaseError(err, res);
            }
            if (results[0]) {
                return sendResponse(res, StatusCodes.OK, results[0]);
            } else {
                return sendResponse(res, StatusCodes.NOT_FOUND);
            }
        })
    }
}


module.exports = {
    allBooks,
    bookDetail,
};


