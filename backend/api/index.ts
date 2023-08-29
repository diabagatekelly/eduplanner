const express = require('express');
const app = express();
const port = 8000;
const userRouter = require("./routes/userRouter");

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end('Hello World!');
  // res.send('Hello World again!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// Routes
app.use("/api/users", userRouter);