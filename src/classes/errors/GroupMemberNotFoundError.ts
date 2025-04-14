import { NotFoundError } from "./NotFoundError.js";

export class GroupMemberNotFoundError extends NotFoundError {

  constructor() {

    super("Group member not found.");

  }

}