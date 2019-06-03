const express = require('express');
const apiRouter = express.Router();
const employeeRouter = require('./employees.js');
const menuRouter = require('./menus.js');

apiRouter.use('/employees', employeeRouter);
apiRouter.use('/menus', menuRouter);

module.exports = apiRouter;
