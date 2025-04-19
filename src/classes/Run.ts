/**
 * A class representing a run.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Filter, ObjectId, UpdateFilter } from "mongodb";
import database from "#utils/database-generator.js";
import isBSONError from "#utils/isBSONError.js";
import User, { UserProperties } from "./User.js";
import Game, { GameProperties } from "./Game.js";
import RunCategory, { RunCategoryProperties } from "./RunCategory.js";
import { RunNotFoundError } from "./errors/RunNotFoundError.js";

export type RunProperties = {
  _id: ObjectId;
  durationMilliseconds: number;
  gameID: ObjectId;
  categoryID?: ObjectId;
  ownerID: ObjectId;
  youtubeWatchID: string;
}

export type ExtendedRunProperties = RunProperties & {
  game: GameProperties;
  category?: RunCategoryProperties;
  owner: UserProperties;
}

export default class Run {

  readonly _id: ObjectId;
  durationMilliseconds: number;
  gameID: ObjectId;
  ownerID: ObjectId;
  categoryID?: ObjectId;
  youtubeWatchID: string;

  static collection = database.collection<RunProperties>("runs");

  constructor(properties: RunProperties) {

    this._id = properties._id;
    this.durationMilliseconds = properties.durationMilliseconds;
    this.gameID = properties.gameID;
    this.ownerID = properties.ownerID;
    this.categoryID = properties.categoryID;
    this.youtubeWatchID = properties.youtubeWatchID;

  }

  /**
   * Creates a run based on the given properties.
   * @param properties Properties to create the run.
   * @returns A newly created Run object.
   */
  static async create(properties: Omit<RunProperties, "_id">): Promise<Run> {

    const runData = {
      ...properties,
      _id: new ObjectId()
    };

    this.collection.insertOne(runData);

    return new Run(runData);

  }

  /**
   * Returns a Run object based on the given thread ID. 
   * @param threadID The run ID to search for.
   * @returns A Run object.
   * @throws {RunNotFoundError} The run must exist.
   */
  static async getFromID(runID: ObjectId | string): Promise<Run> {

    try {

      const data = await this.collection.findOne({
        _id: new ObjectId(runID)
      });

      if (!data) {

        throw new RunNotFoundError(runID);

      }

      return new this(data);

    } catch (error) {

      if (isBSONError(error)) {
      
        throw new RunNotFoundError(runID);
  
      } else {

        throw error;

      }

    }

  }

  static async find(filter: Filter<RunProperties> = {}): Promise<Run[]> {

    const runs = [];

    for (const runData of await this.collection.find(filter).toArray()) {

      const run = new this(runData);
      runs.push(run);

    }

    return runs;

  }

  /**
   * Deletes the run and all associated posts.
   */
  async delete() {

    await Run.collection.deleteOne({
      _id: this._id
    });

  }
  
  /**
   * Updates a run based on the given properties.
   * @param updateFilter A MongoDB filter object
   */
  async edit(updateFilter: UpdateFilter<RunProperties>): Promise<Run> {

    await Run.collection.updateOne({
      _id: this._id
    }, updateFilter);

    const newRun = await Run.getFromID(this._id);
    return newRun;

  }

  async getExtendedProperties(): Promise<ExtendedRunProperties> {

    return {
      ...this,
      game: await Game.getFromID(this.gameID),
      owner: await User.getFromID(this.ownerID),
      ...(this.categoryID ? {
        category: await RunCategory.getFromID(this.categoryID)
      } : {})
    };
    
  }

}