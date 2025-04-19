class ApiError extends Error {
    constructor(
      statuscode,
      message = "Internal Server Error",
      errors = [],
      stack = ""
    ) {
      super(message);
      this.statuscode = statuscode;
      this.errors = errors;
      this.data = null;
      this.message = message;
      this.success = false;
  
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
module.exports = ApiError;