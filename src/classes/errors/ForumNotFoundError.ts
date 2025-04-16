import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class ForumNotFoundError extends NotFoundError {

  constructor(id: ObjectId | string) {

    super(`Forum ${id.toString("hex")} not found.`);

  }

}