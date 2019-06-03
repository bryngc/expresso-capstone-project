const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
  const value = {$timesheetId: timesheetId};

  db.get(sql, value, (error, timesheet) => {
    if (error) {
      next(error);
    } else if (timesheet) {
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

timesheetRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId`,
    {$employeeId: req.params.employeeId},
    (err, timesheets) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({timesheets: timesheets});
      }
    });
});

timesheetRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours,
          rate = req.body.timesheet.rate,
          date = req.body.timesheet.date,
          employeeId = req.params.employeeId;

    const employeeSql = `SELECT * FROM Employee WHERE
    Employee.id = $employeeId`;
    const employeeValues = {$employeeId: employeeId};

    db.get(employeeSql, employeeValues, (error, employee) => {
      if (error) {
        next(error);
      } else {
        if (!hours || !rate || !date || !employee) {
          return res.sendStatus(400);
        }

        const sql = `INSERT INTO Timesheet (hours, rate,
        date, employee_id) VALUES ($hours, $rate, $date,
        $employeeId)`;
        const values = {
          $hours: hours,
          $rate: rate,
          $date: date,
          $employeeId: employeeId
        };

        db.run(sql, values, function(error) {
          if (error) {
            next(error);
          } else {
            db.get(`SELECT * FROM Timesheet WHERE
              Timesheet.id = ${this.lastID}`,
            (error, timesheet) => {
              res.status(201).json({timesheet: timesheet});
            });
          }
        });
      }
    });
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.params.employeeId;

  const employeeSql = `SELECT * FROM Employee WHERE
  Employee.id = $employeeId`;
  const employeeValues = {$employeeId: employeeId};

  db.get(employeeSql, employeeValues, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date || !employee) {
        return res.sendStatus(400);
      }

      const sql = `UPDATE Timesheet SET hours = $hours,
      rate = $rate, date = $date, employee_id = $employeeId
      WHERE Timesheet.id = $timesheetId`;
      const values = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId,
        $timesheetId: req.params.timesheetId
      };

      db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE
            Timesheet.id = ${req.params.timesheetId}`,
          (error, timesheet) => {
            res.status(200).json({timesheet: timesheet});
          });
        }
      });
    }
  });
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    const sql = `DELETE FROM Timesheet WHERE Timesheet.id = $timesheetId`;
    const values = {$timesheetId: req.params.timesheetId};

    db.run(sql, values, (error) => {
      if (error) {
        next(error);
      } else {
        res.sendStatus(204);
      }
    });
});

module.exports = timesheetRouter;
