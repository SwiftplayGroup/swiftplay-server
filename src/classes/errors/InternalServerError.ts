export class InternalServerError extends Error {

  statusCode = 500;

  constructor() {

    super("Something bad happened on our side. Try again later.");

  }

}