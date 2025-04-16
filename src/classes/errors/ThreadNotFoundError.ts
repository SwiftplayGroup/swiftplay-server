import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class ThreadNotFoundError extends NotFoundError {

  constructor(id: ObjectId | string) {

    super(`Thread ${id.toString("hex")} not found.`);

  }

}