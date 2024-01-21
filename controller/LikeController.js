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

    // 액세스 토큰을 검증
    let authorization = ensureAuthorization(req, res);

    if (authorization.error) {
        if (authorization.message === "Access Token must be provided") {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                'message': '로그인이 필요합니다.'
            });
        } else {
            // 새로운 액세스 토큰으로 좋아요 등록
            insertLikeForBook(authorization.id, book_id, res);
        }
    } else {
        // 액세스 토큰이 유효한 경우 좋아요 등록
        insertLikeForBook(authorization.id, book_id, res);
    }
};


// 좋아요를 등록하는 함수
const insertLikeForBook = (user_id, book_id, res) => {
    let sql = likeQueries.insertLikeForBook;
    let values = [user_id, book_id];

    conn.query(sql, values, (err, results) => {
        if (err) {
            return handleDatabaseError(err, res);
        }

        return sendResponse(res, StatusCodes.OK, results);
    });
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