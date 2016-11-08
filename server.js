var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var request = require('request');

var PORT = process.env.VCAP_APP_PORT || 3000;

var app = express(); // server
app.use(bodyParser.json()); // support json encoded bodies
app.use(express.static(__dirname + '/public'));

// render index page
var serverHomePage = function(req, res) {
    res.render('index');
}

app.all('/', serverHomePage);

app.listen(PORT, function() {
    console.log('\nExpress server started. Listening at port: ' + PORT)
});