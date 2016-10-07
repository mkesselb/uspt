/* main server of uspt:
 * starting the listening server, 
 * binding socket.io to listen to websocket connections from the single-page client */

var mysql = require('mysql');
var fs = require('fs');
var crypto = require('crypto');
var winston = require('winston')

var express = require('express');
var https = require('https');
var http = require('http');
var app = express();

var server = http.createServer(app);
var io = require('socket.io')(server);

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'uspt.log' })
    ]
});

app.get('/', function(req, res){
	logger.info('request served');
	fs.createReadStream('uspt.html').pipe(res);
});

var port = 80;
if(process.argv.length > 2){
	//assuming that argument on index 2 is a specified port
	port = process.argv[2];
}

server.listen(port, function(err){
	logger.info('http server listening on port ' + port + '!');
});

//TODO: also support https -> options!
//https.createServer(options, app).listen(443);

//TODO: db connection
//TODO: convert birthday to age
//TODO: convert date.now() to a timestamp for db
io.on('connection', function(socket){
	logger.info('user connected');
	
	var user = {};
	
	socket.on('login', function(data){
		//get login data from json
		logger.info('login data received: ' + JSON.stringify(data));
		
		user.sex = data.sex;
		user.age = data.birthday;
		user.institution = data.institution;
		user.skey = data.survey_key;
		user.date = Date.now();
		
		logger.info('new user: ' + JSON.stringify(user));
		
		var hash = crypto.createHash('sha512');
		hash.update(data.fname + data.lname + data.sex + data.birthday + data.institution + data.survey_key);
		var hash_hex = hash.digest('hex');
		
		logger.info('hash value: ' + hash_hex);
		
		socket.emit('login-success', {hash: hash_hex});
	});
	
	
	
	socket.on('disconnect', function(){
		logger.info('user disconnected');
	});
});

