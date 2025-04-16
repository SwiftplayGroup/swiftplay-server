/**
 * A class representing a post.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Filter, ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import isBSONError from "#utils/isBSONError.js";
import { PostNotFoundError } from "./errors/PostNotFoundError.js";
import Like, { LikeProperties } from "./Like.js";
import { UserNotFoundError } from "./errors/UserNotFoundError.js";

export type PostProperties = {
  _id: ObjectId;
  content: string;
  parentPostID?: ObjectId;
  authorID: ObjectId;
  threadID: ObjectId;
  forumID: ObjectId;
}

export default class Post {

  readonly _id: ObjectId;
  authorID: ObjectId;
  content: string;
  threadID: ObjectId;
  forumID: ObjectId;
  parentPostID?: ObjectId;
  static collection = database.collection<PostProperties>("posts");

  constructor(properties: PostProperties) {

    this._id = properties._id;
    this.content = properties.content;
    this.authorID = properties.authorID;
    this.forumID = properties.forumID;
    this.threadID = properties.threadID;
    this.parentPostID = properties.parentPostID;

  }

  /**
   * Creates a post based on the given properties.
   * @param properties Properties to create the post.
   * @returns A newly created Post object.
   */
  static async create(properties: Omit<PostProperties, "_id">): Promise<Post> {

    const postData = {
      ...properties,
      _id: new ObjectId()
    };

    this.collection.insertOne(postData);

    return new Post(postData);

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

  async deleteLike(filter: Omit<Filter<LikeProperties>, "postID">): Promise<void> {

    await Like.collection.deleteMany({
      ...filter,
      postID: this._id
    });

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