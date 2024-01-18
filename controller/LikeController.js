const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const { likeQueries } = require("../utils/dbQueries");
const ensureAuthorization = require("../auth");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { sendResponse } = require("../utils/responseHandler");
const { handleDatabaseError } = require("../utils/errorHandler");
dotenv.config();

const addLike = (req, res) => {
    const book_id = req.params.id;

    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else {

        let sql = likeQueries.insertLikeForBook;

        let values = [authorization.id, book_id];
        conn.query(sql, values,
            (err, results) => {
                if (err) {
                    return handleDatabaseError(err, res);
                }
                return sendResponse(res, StatusCodes.OK, results);
            })
    }
};

const removeLike = (req, res) => {
    const book_id = req.params.id; // liked_book_id

    let authorization = ensureAuthorization(req, res);

    if (authorization instanceof jwt.TokenExpiredError) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            'message': '로그인 세션이 만료되었습니다.'
        });
    } else if (authorization instanceof jwt.JsonWebTokenError) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            'message': '잘못된 토큰입니다.'
        });
    } else {
        let sql = likeQueries.deleteLikeForBook;
        let values = [authorization.id, book_id];

        conn.query(sql, values,
            (err, results) => {
                if (err) {
                    return handleDatabaseError(err, res);
                }
                return sendResponse(res, StatusCodes.OK, results);
            })
    }
};



module.exports = {
    addLike,
    removeLike
};