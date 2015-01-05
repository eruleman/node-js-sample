var pg = require("pg");
var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

var conString = "pg://OutfitrDBUser:OutfitrDBPassword@outfitrdb.cdqciw4zlodp.us-west-2.rds.amazonaws.com:5432/OutfitrDB";

var client = new pg.Client(conString);
client.connect();

// client.query("CREATE TABLE IF NOT EXISTS emps(firstname varchar(64), lastname varchar(64))");
// client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Ronald', 'McDonald']);
// client.query("INSERT INTO emps(firstname, lastname) values($1, $2)", ['Mayor', 'McCheese']);

client.query("INSERT INTO app_user(username, password, firstname, lastname) values($1, $2, $3, $4)", ['testUser', 'testPassword', 'testFirstName', 'testLastName']);
client.query("INSERT INTO app_user(username, password, firstname, lastname) values($1, $2, $3, $4)", ['testUser2', 'testPassword2', 'testFirstName2', 'testLastName2']);
var query = client.query("SELECT username, password, firstname, lastname FROM app_user ORDER BY lastname, firstname");
query.on("row", function (row, result) {
  result.addRow(row);
});
query.on("end", function (result) {
  console.log(JSON.stringify(result.rows, null, "   "));
  client.end();
})
// var query = client.query("SELECT firstname, lastname FROM emps ORDER BY lastname, firstname");
// query.on("row", function (row, result) {
//     result.addRow(row);
// });
// query.on("end", function (result) {
//     console.log(JSON.stringify(result.rows, null, "    "));
//     client.end();
// });

