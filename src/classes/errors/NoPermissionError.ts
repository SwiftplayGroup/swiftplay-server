export class NoPermissionError extends Error {

  statusCode = 403;

  constructor() {

    super("You don't have permission to do that.");

  }

}