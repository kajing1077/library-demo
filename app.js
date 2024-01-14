// express 모듈
const express = require('express');
const app = express();

// dotenv 모듈
const dotenv = require('dotenv');
dotenv.config();

const userRouter = require('./routes/users');

app.use('/users', userRouter);

app.listen(3000);
