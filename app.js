const express = require('express');
const app = express();
app.listen(3000);

const userRouter = require('./routes/users');
// const channelRouter = require('./routes/channels.js');
//
app.use('/', userRouter);
// app.use('/channels', channelRouter); // 공통된 url 빼주기