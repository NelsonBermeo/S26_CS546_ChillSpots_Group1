import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt'

const checkId = (id, varName) => {
    if (!id) throw `Error: You must provide a ${varName}`;
    if (typeof id !== 'string') throw `Error:${varName} must be a string`;
    id = id.trim();
    if (id.length === 0)
      	throw `Error: ${varName} cannot be an empty string or just spaces`;
    if (!ObjectId.isValid(id)) throw `Error: ${varName} invalid object ID`;
    return id;
}

const checkString = (strVal, varName) => {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== 'string') throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      	throw `Error: ${varName} cannot be an empty string or string with just spaces`;
    if (!isNaN(strVal))
      	throw `Error: ${strVal} is not a valid value for ${varName} as it only contains digits`;
    return strVal;
}

const checkStringArray = (arr, varName) => {
    //We will allow an empty array for this,
    //if it's not empty, we will make sure all tags are strings
    if (!arr || !Array.isArray(arr))
  	    throw `You must provide an array of ${varName}`;
    for (let i in arr) {
		if (typeof arr[i] !== 'string' || arr[i].trim().length === 0) {
			throw `One or more elements in ${varName} array is not a string or is an empty string`;
		}
		arr[i] = arr[i].trim();
		}
    return arr;
}

const checkNumericString = (input, varName) => {
	if (input === undefined || input === null)
		throw `${varName} must exist`
	if (typeof input !== "string")
		throw `${varName} must be a string`
	input = input.trim()
	if (input.length === 0)
		throw `${varName} cannot be empty`;
	for (let i = 0; i < input.length; i++) {
		const charVal = input.charCodeAt(i);
		if (!(charVal >= 48 && charVal <= 57)) {
		throw `${varName} must only contain digits`;
		}
	}
	return input;
};

const check_chars_1 = (input) => {
    //contains letters a-z, spaces, hyphens, apostrophies
    for (let i = 0; i < input.length; i++){
        let charval = input.charCodeAt(i)
        if (!(charval >= 97 && charval <= 122) && !(charval === 45) && !(charval === 32) && !(charval === 39)){
            throw "Error: Input contains invalid chars"
        }
    }
}

const check_chars_2 = (input) => {
    //contains letters a-z, numbers, and underscore only
    for (let i = 0; i < input.length; i++){
        let charval = input.charCodeAt(i)
        if (!(charval >= 97 && charval <= 122) && !(charval >= 48 && charval <= 57) && !(charval === 95)){
            throw "Error: Input contains invalid chars"
        }
    }
}

const check_length = (input, at_least, at_most) => {
    let len = input.length
    if (!(len >= at_least && len <= at_most)){
        throw "Erorr: Input is not correct length"
    }
}

const check_number_range = (input, at_least, at_most) => {
    if (!(input >= at_least && input <= at_most)){
        throw "Erorr: Input is not correct range"
    }
}

const isCharInAlphabet = (chr, ...args) => {
	if (typeof chr !== "string" || chr.length !== 1) {
		throw `Character: "${chr}", is not a string or not a single character.`
	}
	if (!args && args !== []) args = [];
	return (97 <= chr.toLowerCase().charCodeAt(0) && 
			chr.toLowerCase().charCodeAt(0) <= 122) ||
			args.includes(chr); 
}

const isStrInAlphabet = (str, ...args) => {
	str = checkString(str);
	return str.split("").map(e => isCharInAlphabet(e, args)).reduce((b1, b2) => b1 && b2)
}

export const validate = {
	name : (name, property) => {
		name = checkString(name);
		check_length(name, 1, 50);
		if (!isStrInAlphabet(name, "-", " ", ";")) throw `${property} "${name}" contains invalid characters.`;
		return name;
	}, 
	email : (email, property) => {
		email = checkString(email).toLowerCase();
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!(emailRegex.test(email))){
			throw "Error: Invalid email address"
		}
		return email;
	},
	username : (username, property) => {
		username = checkString(username).toLowerCase();
		check_length(username, 3, 20);
		if (!isStrInAlphabet(username, "_", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0"))
			throw `${property} "${name}" contains invalid characters.`;
		return username;
	},
	age : (age, property) => {
		age = Number(checkNumericString(age, "age"));
		check_number_range(age, 13, 120);

		return age;
	},
	password : (password, property) => {
		password = checkString(password);
		check_length(password, 8, 64);
		if (!/[A-Z]/.test(password)) throw "Error: Password must contain at least one uppercase letter";
		if (!/[a-z]/.test(password)) throw "Error: Password must contain at least one lowercase letter";
		if (!/[0-9]/.test(password)) throw "Error: Password must contain at least one number";
		if (!/[^A-Za-z0-9]/.test(password)) throw "Error: Password must contain at least one special character";
		return password; 
	}
};

export { 
  	checkStringArray, 
  	checkString, 
	checkId, 
	checkNumericString, 
	check_chars_1, 
	check_chars_2, 
	check_length, 
	check_number_range}
