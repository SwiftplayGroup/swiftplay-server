import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class PostNotFoundError extends NotFoundError {

  constructor(id: ObjectId | string) {

    super(`Post ${id.toString("hex")} not found.`);

  }

}