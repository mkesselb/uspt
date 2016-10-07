/* main server of uspt:
 * starting the listening server, 
 * binding socket.io to listen to websocket connections from the single-page client */

var mysql = require('mysql');
var fs = require('fs');

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

io.on('connection', function(){
	//TODO: connect to client websocket 
	
});

