import { ObjectId } from "mongodb";
import { NotFoundError } from "./NotFoundError.js";

export class GroupMemberNotFoundError extends NotFoundError {

  constructor(memberID: ObjectId | string) {

    super(`Group member ${memberID.toString("hex")} not found.`);

  }

}