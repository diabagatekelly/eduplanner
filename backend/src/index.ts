const express = require('express');
const app = express();
const port = 8000;

import ConnectMongodb from './mongodb/connectMongodb';
import SeedDefaultDb from './mongodb/seedDefaultDb';

app.get('/', (req, res) => {
  res.send('Hello World again!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

new ConnectMongodb().run().catch(console.error)
new SeedDefaultDb().run().catch(console.error)






