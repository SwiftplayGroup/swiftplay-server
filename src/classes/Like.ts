/**
 * A class representing a like.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import isBSONError from "#utils/isBSONError.js";
import { LikeNotFoundError } from "./errors/LikeNotFoundError.js";

export type LikeProperties = {
  _id: ObjectId;
  userID: ObjectId;
  postID: ObjectId;
}

export default class Like {

  readonly _id: ObjectId;
  userID: ObjectId;
  postID: ObjectId;
  static collection = database.collection<LikeProperties>("likes");

  constructor(properties: LikeProperties) {

    this._id = properties._id;
    this.userID = properties.userID;
    this.postID = properties.postID;

  }

  static async create(properties: Omit<LikeProperties, "_id">): Promise<Like> {

    const likeData = {
      ...properties,
      _id: new ObjectId()
    };

    this.collection.insertOne(likeData);

    return new Like(likeData);

  }

  static async getFromID(groupID: ObjectId | string): Promise<Like> {

    try {

      const data = await Like.collection.findOne({
        _id: new ObjectId(groupID)
      });

      if (!data) {

        throw new LikeNotFoundError(groupID);

      }

      return new Like(data);

    } catch (error) {

      if (isBSONError(error)) {
      
        throw new LikeNotFoundError(groupID);
  
      } else {

        throw error;

      }

    }

  }

  async delete() {

    await Like.collection.deleteOne({
      _id: this._id
    });

  }

}