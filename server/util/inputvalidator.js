/* utility class which handles validating user input */

/* returns true if validation is successful, false otherwise */
function validateID(id){
	//id shall be a number, and not zero-length
	if(isNaN(id) || id.length===0){
		return false;
	}
	return true;
}

function validateText(text, min, max){
	if(text.length > max || text.length < min){
		return false;
	}
	
	return true;
}

function validateNumber(number, min, max){
	if(number > max || number < min){
		return false;
	}
	
	return true;
}

module.exports = {
		validateID		: 	validateID,
		validateText	:	validateText,
		validateNumber	:	validateNumber
};