const conn = require("../mariadb");
const { userQueries } = require("../utils/dbQueries");
const { StatusCodes } = require("http-status-codes");
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const join = (req, res) => {
    const { email, password } = req.body;

    let sql = userQueries.insertUser;

    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');


    let values = [email, hashPassword, salt];
    conn.query(sql, values,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }
            return res.status(StatusCodes.CREATED).json(results);
        })
}

const login = (req, res) => {
    const { email, password } = req.body;

    let sql = userQueries.selectUserByEmail

    conn.query(sql, email,
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(StatusCodes.BAD_REQUEST).end();
            }

            let loginUser = results[0];

            const hashPassword = crypto.pbkdf2Sync(password, loginUser.salt, 10000, 10, 'sha512').toString('base64');


            if (loginUser && loginUser.password === hashPassword) {
                // token 발급
                const token = jwt.sign({
                    id: loginUser.id,
                    email: loginUser.email,
                }, process.env.PRIVATE_KEY, {
                    expiresIn: '1m',
                    issuer: "kim"
                });

                // 토큰 쿠키에 담기
                res.cookie("token", token, {
                    httpOnly: true,
                });
                return res.status(StatusCodes.OK).json(results);
            } else {
                res.status(StatusCodes.UNAUTHORIZED).end();
            }
        }
    )
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

    const salt = crypto.randomBytes(10).toString('base64');
    const hashPassword = crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

    let values = [hashPassword, salt, email];
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