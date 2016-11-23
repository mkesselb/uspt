/* main server of uspt:
 * starting the listening server, 
 * binding socket.io to listen to websocket connections from the single-page client */

var express = require('express');
var crypto = require('crypto');
var mysql = require('mysql');
var https = require('https');
var http = require('http');
var fs = require('fs');

var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

var db = require('./db/db.js');

/* configure logging */
var log4js = require('log4js');
log4js.configure({
	  appenders: [
	    { type: 'console' },
	    { type: 'file', filename: 'uspt.log'}
	  ]
});
var logger = log4js.getLogger();
db.setLogger(logger);

/* building db connection */
//creating connection pool
var pool = mysql.createPool({
	host     : 'localhost',
	user     : 'root',
	password : 'root',
	database : 'uspt'
});

pool.getConnection(function(err, connection){
	//try to establish one connection to see whether db can be reached
	if (err){
		logger.error('error connecting to db: ' + err.toString());
		throw err;
	}

	logger.info('connected to db');
	connection.release();
});

app.get('/', function(req, res){
	logger.info('request served on /');
	fs.createReadStream('uspt.html').pipe(res);
});

app.get('/info', function(req, res){
	logger.info('request served on /info');
	res.send('universal students personality testing - research project - aau klagenfurt');
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

//TODO: handle case where study is cancelled midway by leaving socket (exit window, reload...)
// -> to do so, its probably needed to save undone entries to db (completed 0 --> 1)
// --> or yet better, save to db only after completion?

//TODO: make data objects, e.g. for user, surveyData etc.
//TODO: split socket code in multiple files, one for each 'channel'
//TODO: after split of code in multiple files, also make http endpoints?
//(to detach from sockets, e.g. when used in plugins or moodle)

//TODO: validate input - also client side? html/js "validator"?
//TODO: error codes for client
io.on('connection', function(socket){
	logger.info('user connected');
	
	var user = {};
	
	socket.on('login', function(data){
		//get login data from json
		logger.info('login data received: ' + JSON.stringify(data));
		
		user.sex = data.sex;
		user.age = data.birthday;
		user.institution = data.institution;
		user.survey_key = data.survey_key;
		user.date = Date.now();
		
		var hash = crypto.createHash('sha512');
		hash.update(data.fname + data.lname + data.sex + data.birthday + data.p_info /*+ data.institution + data.survey_key*/);
		var hash_hex = hash.digest('hex');
		
		//TODO: is hash-data enough?
		//additional data is needed, which only the user knows and is not saved in database
		user.hash = hash_hex;
		logger.info('new user: ' + JSON.stringify(user));
		
		//create user in db, if not exists
		pool.getConnection(function(err, connection){
			if(err){
				logger.error('error getting connection from pool: ' + err.toString()); 
				socket.emit('err', {'error' : 403});
				return;
			}
			
			var n_user = {}
			n_user.first_name = data.fname;
			n_user.last_name = data.lname;
			n_user.sex = data.sex;
			n_user.birthday = data.birthday;
			
			db.createUser(connection, n_user, function(err, result){
				if(err){
					//check if err contains known db error code
					if(err.error){
						logger.error('error posting to db: ' + JSON.stringify(err));
						socket.emit('err', err);
					} else{
						//else send unspecified db error
						logger.error('error posting to db: ' + err.toString());
						socket.emit('err', {'error' : 400});
					}
				} else{
					user.id = result.student_id;
					socket.emit('login-success', {hash: hash_hex});
				}
			});
			connection.release();
		});
	});
	
	//TODO: make it possible to unlock specific survey keys (-> admin portal?)
	//e.g. table open_surveys
	socket.on('survey', function(data){
		//get survey data from json
		logger.info('survey data received: ' + JSON.stringify(data));
		
		user.answer = data.f1 + ',' + data.f2;
		logger.info('updated user: ' + JSON.stringify(user));
		
		pool.getConnection(function(err, connection){
			if(err){
				logger.error('error getting connection from pool: ' + err.toString()); 
				socket.emit('err', {'error' : 403});
				return;
			}
			
			var success = false;
			var s_user = {};
			s_user.student_id = user.id;
			s_user.survey_key = user.survey_key;
			//s_user.survey_key = user.date; //TODO: if same date is saved, survey-data could be linked to survey-participant?!
			
			db.writeSurveyParticipation(connection, s_user, function(err, result){
				if(err){
					//check if err contains known db error code
					if(err.error){
						logger.error('error posting to db: ' + JSON.stringify(err));
						socket.emit('err', err);
					} else{
						//else send unspecified db error
						logger.error('error posting to db: ' + err.toString());
						socket.emit('err', {'error' : 400});
					}
				} else{
					//write survey data
					var surveyData = {};
					surveyData.survey_hash = user.hash;
					surveyData.survey_key = user.survey_key;
					surveyData.survey_answers = user.answer; //answer is now csv, to support different test structures
					surveyData.sex = user.sex;
					surveyData.age = user.age; //TODO: change this to birthday? (invariant to time)
					surveyData.institution = user.institution;
					
					db.writeSurvey(connection, surveyData, function(err, result){
						if(err){
							//check if err contains known db error code
							if(err.error){
								logger.error('error posting to db: ' + JSON.stringify(err));
								socket.emit('err', err);
							} else{
								//else send unspecified db error
								logger.error('error posting to db: ' + err.toString());
								socket.emit('err', {'error' : 400});
							}
						} else{
							socket.emit('survey-success');
						}
					});
				}
			});
			connection.release();
		});
	});
	
	socket.on('disconnect', function(){
		logger.info('user disconnected');
	});
});