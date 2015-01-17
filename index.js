var AWS = require('aws-sdk');
var pg = require("pg");
var express = require('express')
var app = express();

// set the region for AWS API requests
AWS.config.region = 'us-west-2';

app.set('port', (process.env.PORT || 8080))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World!')
})

app.get('/createuser', function(request, response) {
  createUser(request.query.username, request.query.password, request.query.firstname, request.query.lastname);
  response.send('User Created! username: ' + request.query.username + ' password: ' + request.query.password +
  ' firstname: ' + request.query.firstname + ' lastname: ' + request.query.lastname);
})

app.get('/get-next-top-id', function(request, response) {
  response.send("" + Math.floor((Math.random() * 9)));
})

app.get('/send-sqs-message', function(request, response) {
  sendSQSMessage(request.query.messagebody);
  response.send("SQS Message sent! Message body: " + request.query.messagebody);
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})

// Configure an Amazon SQS service.
var sqs = new AWS.SQS();
var params = {
  AWSAccountIds: [ /* required */
    '2753-3335-6355',
  ],
  Actions: [ /* required */
    'SendMessage',
    'GetQueueAttributes',
  ],
  Label: 'NodeJSSendMessage', /* required */
  QueueUrl: 'https://sqs.us-west-2.amazonaws.com/275333356355/GenerateNextArticleMLQueue' /* required */
};
sqs.addPermission(params, function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

var conString = "pg://OutfitrDBUser:OutfitrDBPassword@outfitrdb.cdqciw4zlodp.us-west-2.rds.amazonaws.com:5432/OutfitrDB";
var client = new pg.Client(conString);
client.connect();

function createUser(username, password, firstname, lastname) {
  client.query("INSERT INTO app_user(username, password, firstname, lastname) values($1, $2, $3, $4)", [username, password, firstname, lastname]);
  var query = client.query("SELECT username, password, firstname, lastname FROM app_user ORDER BY lastname, firstname");
  query.on("row", function (row, result) {
    result.addRow(row);
  });
  query.on("end", function (result) {
    console.log(JSON.stringify(result.rows, null, "   "));
    client.end();
  })
}

function sendSQSMessage(messageBody) {
  var params = {
    MessageBody: messageBody, /* required */
    QueueUrl: 'https://sqs.us-west-2.amazonaws.com/275333356355/GenerateNextArticleMLQueue', /* required */
    DelaySeconds: 0,
  };
  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    }
    else {
      console.log(data);           // successful response
    }
  });
}
