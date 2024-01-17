const crypto = require('crypto');

const generateSalt = () => crypto.randomBytes(10).toString('base64');

const hashPassword = (password, salt) =>
    crypto.pbkdf2Sync(password, salt, 10000, 10, 'sha512').toString('base64');

const comparePassword = (password, salt, hashedPassword) => {
    const hashPasswordValue = hashPassword(password, salt);
    return hashedPassword === hashPasswordValue;
};

module.exports = {
    generateSalt,
    hashPassword,
    comparePassword
};
