const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");
const { categoryQueries } = require("../utils/dbQueries");
const { handleDatabaseError } = require("../utils/errorHandler");
const { sendResponse } = require("../utils/responseHandler");

const allCategory = (req, res) => {
    let sql = categoryQueries.selectAllCategories;
    conn.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return handleDatabaseError(err, res);
        }
        results.map(function (result) {
            result.id = result.category_id;
            result.name = result.category_name;
            delete result.category_id;
            delete result.category_name;
        });
        return sendResponse(res, StatusCodes.OK, results);
    })
};

module.exports = {
    allCategory
};

