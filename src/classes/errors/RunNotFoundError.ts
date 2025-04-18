import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class RunNotFoundError extends NotFoundError {

  constructor(id: ObjectId | string) {

    super(`Run ${id.toString("hex")} not found.`);

  }

}