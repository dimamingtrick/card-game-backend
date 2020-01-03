class ErrorResponse {
  constructor(message = "", status = 200) {
    this.message = message;
    this.status = status;
  }
}

module.exports = {
  ErrorResponse
};
