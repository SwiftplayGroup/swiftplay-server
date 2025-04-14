export class BadRequestError extends Error {

  statusCode = 400;

  constructor(message = "Bad request") {

    super(message);

  }

}