const conn = require("../mariadb");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { StatusCodes } = require("http-status-codes");
const { userQueries } = require("../utils/dbQueries");
const { generateSalt, hashPassword, comparePassword } = require("../utils/encryption");
const { handleDatabaseError } = require("../utils/errorHandler");
const { sendResponse } = require("../utils/responseHandler");

dotenv.config();

const join = (req, res) => {
    const { email, password } = req.body;

    let sql = userQueries.insertUser;

    const salt = generateSalt();
    const hashPasswordValue = hashPassword(password, salt);

    let values = [email, hashPasswordValue, salt];
    conn.query(sql, values,
        (err, results) => {
            if (err) {
                return handleDatabaseError(err, res);
            }

            if (results.affectedRows) {
                return sendResponse(res, StatusCodes.CREATED, results);
            } else {
                return sendResponse(res, StatusCodes.BAD_REQUEST);
            }
        }
    );
};

const login = (req, res) => {
    const { email, password } = req.body;

    let sql = userQueries.selectUserByEmail;

    conn.query(sql, email,
        (err, results) => {
            if (err) {
                return handleDatabaseError(err, res);
            }

            const loginUser = results[0];

            if (!loginUser || !comparePassword(password, loginUser.salt, loginUser.password)) {
                return sendResponse(res, StatusCodes.UNAUTHORIZED);
            }

            const salt = loginUser.salt;
            const hashPasswordValue = hashPassword(password, salt);

            if (loginUser && loginUser.password === hashPasswordValue) {
                // 액세스 토큰 발급
                const accessToken = jwt.sign({
                    id: loginUser.id,
                    email: loginUser.email,
                }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: '2m',
                    issuer: "kim"
                });

                // 리프레시 토큰 발급
                const refreshToken = jwt.sign({
                    id: loginUser.id,
                    email: loginUser.email,
                }, process.env.REFRESH_TOKEN_SECRET, {
                    expiresIn: '10m',
                    issuer: "kim"
                });

                // 액세스 토큰을 클라이언트에게 전달
                res.cookie("token", accessToken, {
                    httpOnly: true,
                });

                // 리프레시 토큰을 클라이언트에게 전달
                res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                });

                return sendResponse(res, StatusCodes.OK, results[0]);
            }
            return sendResponse(res, StatusCodes.UNAUTHORIZED);
        }
    );
}


const passwordResetRequest = (req, res) => {
    const { email } = req.body;

    let sql = userQueries.selectUserByEmail;

    conn.query(sql, email,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            // 이메일로 유저 있는지 찾아보기
            const user = results[0];
            if (user) {
                return res.status(StatusCodes.OK).json({
                    email: email
                });
            } else {
                return res.status(StatusCodes.UNAUTHORIZED).end();
            }
        }
    )
};

const passwordReset = (req, res) => {
    const { password, email } = req.body;


    let sql = userQueries.updateUserPassword;

    const salt = generateSalt();
    const hashPasswordValue = hashPassword(password, salt);

    let values = [hashPasswordValue, salt, email];
    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            if (results.affectedRows === 0) {
                return res.status(StatusCodes.BAD_REQUEST).end();
            } else {
                res.status(StatusCodes.OK).json(results);
            }
        }
    )
};

module.exports = {
    join,
    login,
    passwordResetRequest,
    passwordReset
}