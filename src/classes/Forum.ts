/**
 * A class representing a forum.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Filter, ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import isBSONError from "#utils/isBSONError.js";
import Thread, { ThreadProperties } from "./Thread.js";
import { ForumNotFoundError } from "./errors/ForumNotFoundError.js";

export type ForumProperties = {
  _id: ObjectId;
  name: string;
  description: string;
}

export default class Forum {

  readonly _id: ObjectId;
  name: string;
  description: string;
  static collection = database.collection<ForumProperties>("forums");

  constructor(properties: ForumProperties) {

    this._id = properties._id;
    this.name = properties.name;
    this.description = properties.description;

  }

  static async getFromID(groupID: ObjectId | string): Promise<Forum> {

    try {

      const data = await Forum.collection.findOne({
        _id: new ObjectId(groupID)
      });

      if (!data) {

        throw new ForumNotFoundError(groupID);

      }

      return new Forum(data);

    } catch (error) {

      if (isBSONError(error)) {
      
        throw new ForumNotFoundError(groupID);
  
      } else {

        throw error;

      }

    }

  }

  /**
   * 
   * @param filter 
   * @returns 
   */
  async createThread(filter: Omit<Parameters<(typeof Thread)["create"]>[0], "forumID">): Promise<Thread> {

    return await Thread.create({...filter, forumID: this._id});

  }

  async getThreads(filter: Omit<Filter<ThreadProperties>, "forumID"> = {}): Promise<Thread[]> {

    const threadDataArray = await Thread.collection.find({
      ...filter, 
      forumID: this._id
    }).toArray();

    const threads = [];

    for (const threadData of threadDataArray) {

      const thread = new Thread(threadData);

      threads.push(thread);

    }

    return threads;

  }

}