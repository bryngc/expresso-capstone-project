const express = require('express');
const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemRouter = require('./menu-items.js');

menuRouter.param('menuId', (req, res, next, menuId) => {
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
  const value = {$menuId: menuId};

  db.get(sql, value, (error, menu) => {
    if (error) {
      next(error);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuRouter.use('/:menuId/menu-items', menuItemRouter);

menuRouter.get('/', (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({menus: menus});
    }
  });
});

menuRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menuRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.sendStatus(400);
  }

  const sql = `INSERT INTO Menu (title)
  VALUES ($title)`;
  const value = {$title: title};

  db.run(sql, value, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`,
      (error, menu) => {
        res.status(201).json({menu: menu});
      });
    }
  });
});

menuRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    return res.sendStatus(400);
  }

  const sql = `UPDATE Menu SET title = $title
  WHERE Menu.id = $menuId`;
  const value = {$title: title, $menuId: req.params.menuId};

  db.run(sql, value, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
      (error, menu) => {
        res.status(200).json({menu: menu});
      });
    }
  });
});

menuRouter.delete('/:menuId', (req, res, next) => {

  const menuItemSql = `SELECT * FROM MenuItem WHERE
  menu_id = ${req.params.menuId}`;

db.get(menuItemSql, (error, menu) => {
  if (error) {
    next(error);
  } else if (menu) {
    res.sendStatus(400);
  } else {
      const sql = `DELETE FROM Menu WHERE Menu.id = $menuId`;
      const values = {$menuId: req.params.menuId};
      db.run(sql, values, (error) => {
          res.sendStatus(204);
      });
    }
  });
});

module.exports = menuRouter;
