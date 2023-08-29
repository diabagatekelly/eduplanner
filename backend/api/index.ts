const express = require('express');
const app = express();
const port = 8000;
const userRouter = require("../src/routes/userRouter");

app.use('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.send('Hello World again!');
});


app.use('/404', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.send('OOPs!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Routes
app.use("/api/users", userRouter);

// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('../routes/index');

// var app = express();

// const whitelist = [
//   '*'
// ];

// app.use((req, res, next) => {
//   const origin = req.get('referer');
//   const isWhitelisted = whitelist.find((w) => origin && origin.includes(w));
//   if (isWhitelisted) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//   }
//   // Pass to next layer of middleware
//   if (req.method === 'OPTIONS') res.sendStatus(200);
//   else next();
// });

// const setContext = (req, res, next) => {
//   if (!req.context) req.context = {};
//   next();
// };
// app.use(setContext);

// app.use('/', indexRouter);

module.exports = app;
