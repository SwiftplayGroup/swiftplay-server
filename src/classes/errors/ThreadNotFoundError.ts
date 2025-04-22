import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class ThreadNotFoundError extends NotFoundError {
  constructor(id: ObjectId | string | undefined) {
    super(`Thread ${id ? id.toString() : "undefined"} not found.`);
  }
}
