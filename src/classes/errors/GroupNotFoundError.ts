import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class GroupNotFoundError extends NotFoundError {

  constructor(id: ObjectId | string) {

    super(`Group ${id.toString("hex")} not found.`);

  }

}