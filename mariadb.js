const mariadb = require('mysql2');

// create the connection to database

const connection = mariadb.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Bookshop',
    dateStrings: true,
});

module.exports = connection;