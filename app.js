var bodyParser = require('body-parser');
var express = require('express'); // server

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var csvjson = require('csvjson');
var fs = require('fs');
var _= require('underscore');
var PORT = process.env.VCAP_APP_PORT || 3000;
// create a new express server
var app = express();
var middleware = require('./middleware.js'); // middleware functions

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // support json encoded bodies
app.use(middleware.logger);

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// render index page
var serverHomePage = function(req, res) {
    res.render('index');
}

app.all('/', serverHomePage);

var users = {
  'hsbc':"apple123"
};

app.post('/login', function(req, res){
  var body = _.pick(req.body, 'entity', 'password');
  
  console.log('body.entity in lower case is: ' +body.entity.toLowerCase());
  console.log(_.has(users, body.entity.toLowerCase()));
  if (_.has(users, body.entity.toLowerCase()) && users[body.entity] == body.password.toLowerCase()) {
    res.send('entity is in users');
  } else {
    res.send('entity is NOT recognised');
  }
});

// start server on the specified port and binding host
app.listen(PORT, function() {
  // print a message when the server starts listening
  console.log("server starting on " + PORT);
});
