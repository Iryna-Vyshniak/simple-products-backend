const errorMessages = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
};

const HttpError = (status, message = errorMessages[status]) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = HttpError;

/* 
class HttpError extends Error {
constructor(statusCode, message){
super();
this.statusCode = statusCode;
this.message = message;
}
}

module.exports = HttpError;

=> throw new Error(409, 'User with this email address already exists')
*/
