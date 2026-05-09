import {ObjectId} from 'mongodb';

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

const check_length = (input, at_least , at_most) => {
    let len = input.length
    if (!(len >= at_least && len <= at_most)){
        throw "Erorr: Input is not correct length"
    }
}

const check_number_range = (input, at_least , at_most) => {
    if (!(input >= at_least && input <= at_most)){
        throw "Erorr: Input is not correct range"
    }
}

export {checkStringArray, checkString, checkId, checkNumericString, check_chars_1, check_chars_2, check_length, check_number_range}
