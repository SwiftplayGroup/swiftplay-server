import { ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import isErrorBSONError from "#utils/isErrorBSONError.js";
import { LikeNotFoundError } from "./errors/LikeNotFoundError.js";

export type LikeProperties = {
  _id: ObjectId;
  userID: ObjectId;
}

export default class Like {

  readonly _id: ObjectId;
  userID: ObjectId;
  static collection = database.collection<LikeProperties>("likes");

  constructor(properties: LikeProperties) {

    this._id = properties._id;
    this.userID = properties.userID;

  }

  static async getFromID(groupID: ObjectId | string) {

    try {

      const data = await Like.collection.findOne({
        _id: new ObjectId(groupID)
      });

      if (!data) {

        throw new LikeNotFoundError(groupID);

      }

      return new Like(data);

    } catch (error) {

      if (isErrorBSONError(error)) {
      
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