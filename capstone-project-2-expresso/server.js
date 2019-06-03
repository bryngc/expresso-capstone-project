const express = require('express');
const app = express();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const errorHandler = require('errorhandler');
app.use(errorHandler());

const morgan = require('morgan');
app.use(morgan('dev'));

const cors = require('cors');
app.use(cors();

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('Listening on port: ' + PORT);
});

module.exports = app;
