const { StatusCodes } = require("http-status-codes");

const handleDatabaseError = (err, res) => {
    console.error(err);
    return res.status(StatusCodes.BAD_REQUEST).end();
};

module.exports = {
    handleDatabaseError,
};
