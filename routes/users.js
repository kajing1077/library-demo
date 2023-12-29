const express = require('express');
const router = express.Router(); // 라우터로 활용 가능
const conn = require('../mariadb.js');
router.use(express.json());

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    let sql = `SELECT * FROM users WHERE email = ?`
    conn.query(sql, email,
        function (err, results) {
            let loginUser = results[0];

            if (loginUser && loginUser.password === password) {
                res.status(200).json({
                    message: `${ loginUser.email } 님 로그인 되었습니다.`
                })
            } else {
                res.status(404).json({
                    message: "이메일 또는 비밀번호가 틀렸습니다."
                })
            }
        }
    )
})

router.post('/join', (req, res) => {
    if (req.body === {}) {
        res.status(400).json({
            message: `입력값을 다시 확인해주세요.`
        })
    } else {
        const { email, password } = req.body;

        let sql = `INSERT INTO users (email, password) VALUES (?, ?)`
        let values = [email, password];
        conn.query(sql, values,
            function (err, results) {
                res.status(201).json(results);
            }
        )
    }
})

module.exports = router;
