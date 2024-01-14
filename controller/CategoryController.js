const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const { categoryQueries } = require("../utils/dbQueries");

const allCategory = (req, res) => {
    let sql = categoryQueries.selectAllCategories;
    conn.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(StatusCodes.BAD_REQUEST).end();
        }
        return res.status(StatusCodes.OK).json(results);
    })
};

module.exports = {
    allCategory
};

