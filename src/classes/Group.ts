/**
 * A class representing a group.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import { GroupNotFoundError } from "./errors/GroupNotFoundError.js";
import isBSONError from "#utils/isBSONError.js";

export type GroupProperties = {
  _id: ObjectId;
  name: string;
}

export default class Group {

  readonly _id: ObjectId;
  name: string;

  constructor(properties: GroupProperties) {

    this._id = properties._id;
    this.name = properties.name;

  }

  static async getFromID(groupID: ObjectId | string) {

    try {

      const data = await database.collection<GroupProperties>("groups").findOne({
        _id: new ObjectId(groupID)
      });

      if (!data) {

        throw new GroupNotFoundError(groupID);

      }

      return new Group(data);

    } catch (error) {

      if (isBSONError(error)) {
      
        throw new GroupNotFoundError(groupID);
  
      } else {

        throw error;

      }

    }

  }

  async addMember(userID: ObjectId) {

    await database.collection("groupMembers").updateOne({
      groupID: this._id,
      userID
    }, {
      $set: {
        groupID: this._id,
        userID
      }
    }, {
      upsert: true
    });

  }

  async getMembers() {

    return await database.collection("groupMembers").find({
      groupID: this._id
    }).toArray();

  }

}