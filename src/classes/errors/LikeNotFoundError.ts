import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class LikeNotFoundError extends NotFoundError {

  constructor(id: ObjectId | string) {

    super(`Like ${id.toString("hex")} not found.`);

  }

}