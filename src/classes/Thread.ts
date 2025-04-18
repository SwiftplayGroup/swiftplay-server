/**
 * A class representing a thread.
 *
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Filter, ObjectId, UpdateFilter } from "mongodb";
import database from "#utils/database-generator.js";
import isBSONError from "#utils/isBSONError.js";
import { ThreadNotFoundError } from "./errors/ThreadNotFoundError.js";
import Post, { PostProperties } from "./Post.js";

export type ThreadProperties = {
  _id: ObjectId;
  title: string;
  authorID: ObjectId;
  forumID: ObjectId;
  mainPostID?: ObjectId;
  embeddings: number[];
};

export default class Thread {
  readonly _id: ObjectId;
  authorID: ObjectId;
  title: string;
  forumID: ObjectId;
  mainPostID?: ObjectId;
  embeddings: number[];
  static collection = database.collection<ThreadProperties>("threads");

  constructor(properties: ThreadProperties) {
    this._id = properties._id;
    this.title = properties.title;
    this.authorID = properties.authorID;
    this.forumID = properties.forumID;
    this.mainPostID = properties.mainPostID;
    this.embeddings = properties.embeddings;
  }

  /**
   * Creates a thread based on the given properties.
   * @param properties Properties to create the thread.
   * @returns A newly created Thread object.
   */
  static async create(
    properties: Omit<ThreadProperties, "_id">,
  ): Promise<Thread> {
    const threadData = {
      ...properties,
      _id: new ObjectId(),
    };

    this.collection.insertOne(threadData);

    return new Thread(threadData);
  }

  /**
   * Returns a Thread object based on the given thread ID.
   * @param threadID The thread ID to search for.
   * @returns A Thread object.
   * @throws {ThreadNotFoundError} The thread must exist.
   */
  static async getFromID(threadID: ObjectId | string): Promise<Thread> {
    try {
      const data = await Thread.collection.findOne({
        _id: new ObjectId(threadID),
      });

      if (!data) {
        throw new ThreadNotFoundError(threadID);
      }

      return new Thread(data);
    } catch (error) {
      if (isBSONError(error)) {
        throw new ThreadNotFoundError(threadID);
      } else {
        throw error;
      }
    }
  }

  static async find(filter: Filter<ThreadProperties> = {}): Promise<Thread[]> {
    const threads = [];

    for (const threadData of await this.collection.find(filter).toArray()) {
      const thread = new Thread(threadData);
      threads.push(thread);
    }

    return threads;
  }

  /**
   * Creates a post based on the given properties.
   * @param properties Properties to create the thread.
   * @returns A newly created Thread object.
   */
  async createPost(
    filter: Omit<
      Parameters<(typeof Post)["create"]>[0],
      "forumID" | "threadID"
    >,
  ): Promise<Post> {
    return await Post.create({
      ...filter,
      forumID: this.forumID,
      threadID: this._id,
    });
  }

  /**
   * Deletes the thread and all associated posts.
   */
  async delete() {
    // Delete all associated posts.
    await Post.collection.deleteMany({
      threadID: this._id,
    });

    // Delete the thread.
    await Thread.collection.deleteOne({
      _id: this._id,
    });
  }

  /**
   * Updates a thread based on the given properties.
   * @param updateFilter A MongoDB filter object
   */
  async edit(updateFilter: UpdateFilter<ThreadProperties>): Promise<void> {
    Thread.collection.updateOne(
      {
        _id: this._id,
      },
      updateFilter,
    );
  }

  /**
   * Returns a list of posts from this thread.
   * @param filter Post properties to search for. `threadID` is automatically included.
   * @returns A list of Post objects.
   */
  async getPosts(
    filter: Omit<Filter<PostProperties>, "threadID"> = {},
  ): Promise<Post[]> {
    const threadDataArray = await Post.collection
      .find({
        ...filter,
        threadID: this._id,
      })
      .toArray();

    const posts = [];

    for (const postData of threadDataArray) {
      const post = new Post(postData);

      posts.push(post);
    }

    return posts;
  }
}
