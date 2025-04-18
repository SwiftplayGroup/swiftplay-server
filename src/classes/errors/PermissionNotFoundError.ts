import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class PermissionNotFoundError extends NotFoundError {

  constructor(id: ObjectId | string) {

    super(`Permission ${id.toString("hex")} not found.`);

  }

}