import { Filter, ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import isBSONError from "#utils/isBSONError.js";
import { PostNotFoundError } from "./errors/PostNotFoundError.js";
import Like, { LikeProperties } from "./Like.js";
import { UserNotFoundError } from "./errors/UserNotFoundError.js";

export type ThreadProperties = {
  _id: ObjectId;
  title?: string;
  authorID: ObjectId;
  forumID: ObjectId;
}

export default class Post {

  readonly _id: ObjectId;
  authorID: ObjectId;
  title?: string;
  threadID?: ObjectId;
  forumID: ObjectId;
  static collection = database.collection<ThreadProperties>("threads");

  constructor(properties: ThreadProperties) {

    this._id = properties._id;
    this.title = properties.title;
    this.authorID = properties.authorID;
    this.forumID = properties.forumID;

  }

  static async getFromID(groupID: ObjectId | string): Promise<Post> {

    try {

      const data = await Post.collection.findOne({
        _id: new ObjectId(groupID)
      });

      if (!data) {

        throw new PostNotFoundError(groupID);

      }

      return new Post(data);

    } catch (error) {

      if (isBSONError(error)) {
      
        throw new PostNotFoundError(groupID);
  
      } else {

        throw error;

      }

    }

  }

  async getLikes(filter: Omit<Filter<LikeProperties>, "postID"> = {}): Promise<Like[]> {

    const likeDataArray = await Like.collection.find({
      ...filter, 
      postID: this._id
    }).toArray();

    const likes = [];

    for (const likeData of likeDataArray) {

      const like = new Like(likeData);

      likes.push(like);

    }

    return likes;

  }

  async like(userID: ObjectId | string): Promise<Like> {

    try {

      return await Like.create({
        postID: this._id,
        userID: new ObjectId(userID)
      });

    } catch (error) {

      if (isBSONError(error)) {

        throw new UserNotFoundError(userID);

      } else {

        throw error;

      }

    }

  }

  async delete() {

    await Post.collection.deleteOne({
      _id: this._id
    });

  }

}