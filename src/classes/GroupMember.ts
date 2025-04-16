/**
 * A class representing a group member.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

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

  static async getFromUserID(groupID: ObjectId, userID: ObjectId | string) {

    try {

      const data = await database.collection<GroupMemberProperties>("groupMembers").findOne({
        groupID,
        userID: new ObjectId(userID)
      });

      if (!data) {

        throw new GroupMemberNotFoundError(userID);

      }

      return new GroupMember(data);

    } catch (error) {

      if (error instanceof Error && error.name.slice(0, 9) === "BSONError") {
            
        throw new GroupMemberNotFoundError(userID);
  
      } else {

        throw error;

      }

    }

  }

  async remove() {

    await database.collection<GroupMemberProperties>("groupMembers").deleteOne({
      groupID: this.groupID,
      userID: this.userID
    });
    
  }

}