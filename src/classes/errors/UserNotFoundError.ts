import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class UserNotFoundError extends NotFoundError {

  constructor(id: string | ObjectId) {

    super(`User ${id.toString("hex")} not found.`);

  }

}