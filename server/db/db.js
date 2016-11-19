/* module handling the database connections */

var validator = require('../util/inputvalidator.js');
var logger;

function setLogger(logg){
	logger = logg;
}

function createUser(dbConnection, userData, callback){
	//validate input parameters
	if(!validator.validateText(userData.first_name, 1, 20) || 
			!validator.validateText(userData.last_name, 1, 20) || 
			!validator.validateText(userData.sex, 1, 1) || 
			!validator.validateText(userData.birthday, 8, 8)){
		
		//malformed userData
		return callback({'error' : 300});
	}
	
	//first, query if user already exists. if so, return id
	getUser(dbConnection, userData, function(err, result){
		if(err){
			return callback(err);
		}
		if(result.length > 0){ 
			return callback(null, {'student_id' : result[0].student_id});
		} else{
			//if user does not exist, create the user, then query and return id
			dbConnection.query('insert into students set ?', userData, function(err, result){
				if(err){
					return callback(err);
				}
				
				logger.info('user created! id: ' + result.insertId);
				return callback(null, {'student_id' : result.insertId});
			});
		}
	});
}

function getUser(dbConnection, userData, callback){
	var query = 'select student_id from students where ' +
		'first_name = ? and last_name = ? and sex = ? and birthday = ?';
	
	logger.info('user data to fetch: ' + JSON.stringify(userData));
	
	dbConnection.query(query, [userData.first_name, userData.last_name, userData.sex, userData.birthday], 
			function(err,result){
		if(err){
			return callback(err);
		}
		
		logger.info('user found: ' + JSON.stringify(result));
		callback(null, result);
	});
};

function writeSurveyParticipation(dbConnection, userData, callback){
	//validate input parameters
	if(!validator.validateID(userData.student_id) || 
			!validator.validateText(userData.survey_key, 1, 20)){
				
		//malformed userData
		return callback({'error' : 300});
	}
	
	//only write survey participation if pair of (student_id, survey_key) does not exist yet
	//-> only one participation per survey allowed
	var query = 'select student_id from survey_participants where ' +
		'student_id = ? and survey_key = ?';
	
	logger.info('participation to check: ' + JSON.stringify(userData));
	dbConnection.query(query, [userData.student_id, userData.survey_key], function(err, result){
		if(err){
			return callback(err);
		}
		
		if(result.length > 0){
			//student already participated with given survey_key
			logger.info('participation not allowed twice');
			return callback({'error' : 500});
		} else{
			//write participation
			dbConnection.query('insert into survey_participants set ?', userData, function(err, result){
				if(err){
					return callback(err);
				}
				
				logger.info('participation written');
				return callback(null, {'success' : 1});
			});
		}
	});
};

function writeSurvey(dbConnection, surveyData, callback){
	//validate input parameters
	if(!validator.validateText(surveyData.survey_hash, 128, 128) || 
			!validator.validateText(surveyData.survey_key, 1, 20) ||
			!validator.validateText(surveyData.institution, 1, 20) ||
			!validator.validateText(surveyData.sex, 1, 1) || 
			!validator.validateText(surveyData.age, 8, 8)){
		
		//malformed userData
		return callback({'error' : 300});
	}
	
	//write survey data
	//TODO: it could be possible to check whether the pair of survey_hash+survey_key is already saved
	//-> depending on, whether it should be allowed to do survey twice with same key or not
	//--> probably not, but now it is already checked before insertion...
	
	dbConnection.query('insert into survey_data set ?', surveyData, function(err, result){
		if(err){
			return callback(err);
		}
		
		logger.info('survey data written: ' + JSON.stringify(surveyData));
		return callback(null, {'success' : 1});
	});
};

function establishHashMapping(dbConnection, requestData, callback){
	//TODO: create mapping of two different hashes to one another
}

module.exports = {
		setLogger				:	setLogger,
		createUser				:	createUser,
		writeSurvey				:	writeSurvey,
		establishHashMapping	:	establishHashMapping,
		writeSurveyParticipation:	writeSurveyParticipation
};
