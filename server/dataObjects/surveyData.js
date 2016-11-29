/* module which serves as data object for surveyData. */

function SurveyData(survey_hash, survey_key, survey_answers, sex, age, institution){
	this.survey_hash = survey_hash;
	this.survey_key = survey_key;
	this.survey_answers = survey_answers;
	this.sex = sex;
	this.age = age;
	this.institution = institution;
};

module.exports = SurveyData;