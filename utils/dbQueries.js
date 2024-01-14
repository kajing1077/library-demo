const userQueries = {
    insertUser: `INSERT INTO Bookshop.users (email, password, salt) VALUES (?, ?, ?)`,
    selectUserByEmail: `SELECT * FROM Bookshop.users WHERE email = ?`,
    updateUserPassword: `UPDATE Bookshop.users SET password=?, salt=? WHERE email = ?`
};

const categoryQueries = {
    selectAllCategories: `SELECT * FROM Bookshop.category`
};

module.exports = { userQueries, categoryQueries};

