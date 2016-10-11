/* module handling the database connections */
//TODO: make logging in db possible

var validator = require('../util/inputvalidator.js');

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
		if(result.size > 0){
			return callback(null, result);
		}
	});
	
	//if user does not exist, create the user, then query and return id
	dbConnection.query('insert into students set ?', userData, function(err, result){
		if(err){
			return callback(err);
		}
		
		getUser(dbConnection, userData, function(err, result){
			if(err){
				return callback(err);
			}
			if(result.size > 0){
				return callback(null, result);
			}
		})
	});
}

function getUser(dbConnection, userData, callback){
	//correct userData is assumed
	var query = 'select student_id from students where ' +
		'first_name = ? and last_name = ? and sex = ? and birthday = ?';
	
	dbConnection.query(query, userData, function(err,result){
		if(err){
			return callback(err);
		}
		
		callback(null, result);
	});
};

function completeSurvey(dbConnection, surveyData, callback){
	
}

function establishHashMapping(dbConnection, requestData, callback){
	
}

module.exports = {
		createUser				:	createUser,
		completeSurvey			:	completeSurvey,
		establishHashMapping	:	establishHashMapping
};
