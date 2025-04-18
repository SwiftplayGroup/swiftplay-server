import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class CategoryNotFoundError extends NotFoundError {

  constructor(id: ObjectId | string) {

    super(`Category ${id.toString("hex")} not found.`);

  }

}