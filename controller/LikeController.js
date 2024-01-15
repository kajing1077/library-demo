const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const { likeQueries } = require("../utils/dbQueries")
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
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
                    console.log(err);
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }
                return res.status(StatusCodes.OK).json(results);
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
                    console.log(err);
                    return res.status(StatusCodes.BAD_REQUEST).end();
                }
                return res.status(StatusCodes.OK).json(results);
            })
    }
};

function ensureAuthorization(req, res) {
    try {
        let receivedJwt = req.headers["authorization"];
        console.log("received Jwt : ", receivedJwt);

        let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
        console.log("decoded jwt : ", decodedJwt);

        return decodedJwt;

    } catch (err) {
        console.log(err.name);
        console.log(err.message);
        return err;
    }
}

module.exports = {
    addLike,
    removeLike
};