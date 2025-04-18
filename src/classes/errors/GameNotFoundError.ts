import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class GameNotFoundError extends NotFoundError {

  constructor(id: ObjectId | string) {

    super(`Game ${id.toString("hex")} not found.`);

  }

}