class ExternalError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ExternalError';
    if (status !== undefined) {
      this.status = status;
    }
  }
}

module.exports = ExternalError;
