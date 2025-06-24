const express = require('express');
const bodyParser = require('body-parser');
const routes = require('../routes');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.use(routes)

app.listen(3000, () => {
  console.log('Server started on port 3000');
});