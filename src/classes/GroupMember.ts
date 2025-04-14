import { ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import { GroupMemberNotFoundError } from "./errors/GroupMemberNotFoundError.js";

export type GroupMemberProperties = {
  _id: ObjectId;
  groupID: ObjectId;
  userID: ObjectId;
  isAdmin: boolean;
}

export default class GroupMember {

  readonly _id: ObjectId;
  groupID: ObjectId;
  userID: ObjectId;
  isAdmin: boolean;

  constructor(properties: GroupMemberProperties) {

    this._id = properties._id;
    this.groupID = properties.groupID;
    this.userID = properties.userID;
    this.isAdmin = properties.isAdmin;

  }

  static async getFromID(groupID: ObjectId, userID: ObjectId) {

    const data = await database.collection<GroupMemberProperties>("groupMembers").findOne({
      groupID,
      userID
    });

    if (!data) {

      throw new GroupMemberNotFoundError();

    }

    return new GroupMember(data);

  }

}