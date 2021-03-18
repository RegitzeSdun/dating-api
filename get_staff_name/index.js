var Connection = require('tedious').Connection;
var Request = require('tedious').Request
var TYPES = require('tedious').TYPES;
const config = require('./config.json')

const executeSQL = (context, letter) => {
    var result = "";

    // Create Connection object
    const connection = new Connection(config)

    // Create the command to be executed
    const request = new Request(`SELECT * from sales.staffs WHERE(lower(first_name) LIKE '%${letter}')`, function (err) {
        if (err) {
            context.log.error(err);
            context.res.status = 500;
            context.res.body = "Error executing T-SQL command";
        } else {
            context.res = {
                body: result
            }
        }
        context.done();
    });

    // Handle 'connect' event
    connection.on('connect', err => {
        if (err) {
            context.log.error(err);
            context.res.status = 500;
            context.res.body = "Error connecting to Azure SQL query";
            context.done();
        }
        else {
            // Connection succeeded so execute T-SQL
            connection.execSql(request);
        }
    });

    // Handle result set sent back from Azure SQL
    request.on('row', columns => {
        columns.forEach(column => {
            result += column.value;
        });
    });

    // Connect
    connection.connect();
}

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const letter = (req.query.letter || (req.body && req.body.letter));

    executeSQL(context, letter)
}
