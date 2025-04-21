/**
 * A class representing a game.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Filter, ObjectId, UpdateFilter } from "mongodb";
import database from "#utils/database-generator.js";
import isBSONError from "#utils/isBSONError.js";
import Run from "./Run.js";
import { GameNotFoundError } from "./errors/GameNotFoundError.js";
import RunCategory from "./RunCategory.js";

export type GameProperties = {
  _id: ObjectId;
  name: string;
}

export default class Game {

  readonly _id: ObjectId;
  name: string;

  static collection = database.collection<GameProperties>("games");

  constructor(properties: GameProperties) {

    this._id = properties._id;
    this.name = properties.name;

  }

  /**
   * Creates a game based on the given properties.
   * @param properties Properties to create the game.
   * @returns A newly created Game object.
   */
  static async create(properties: Omit<GameProperties, "_id">): Promise<Game> {

    const data = {
      ...properties,
      _id: new ObjectId()
    };

    this.collection.insertOne(data);

    return new Game(data);

  }

  /**
   * Returns a Game object based on the given thread ID. 
   * @param threadID The game ID to search for.
   * @returns A Game object.
   * @throws {GameNotFoundError} The game must exist.
   */
  static async getFromID(threadID: ObjectId | string): Promise<Game> {

    try {

      const data = await this.collection.findOne({
        _id: new ObjectId(threadID)
      });

      if (!data) {

        throw new GameNotFoundError(threadID);

      }

      return new this(data);

    } catch (error) {

      if (isBSONError(error)) {
      
        throw new GameNotFoundError(threadID);
  
      } else {

        throw error;

      }

    }

  }

  static async find(filter: Filter<GameProperties> = {}): Promise<Game[]> {

    const games = [];

    for (const gameData of await this.collection.find(filter).toArray()) {

      const game = new this(gameData);
      games.push(game);

    }

    return games;

  }

  /**
   * Deletes the game and all associated posts.
   */
  async delete() {

    // Delete all associated runs.
    await Run.collection.deleteMany({
      gameID: this._id
    });

    // Delete all associated categories.
    await RunCategory.collection.deleteMany({
      gameID: this._id
    });

    // Delete the game itself.
    await Game.collection.deleteOne({
      _id: this._id
    });

  }
  
  /**
   * Updates a game based on the given properties.
   * @param updateFilter A MongoDB filter object
   */
  async edit(updateFilter: UpdateFilter<GameProperties>): Promise<void> {

    await Game.collection.updateOne({
      _id: this._id
    }, updateFilter);

  }

  /**
   * Get a list of categories that are connected to this game.
   * @returns A list of RunCategory objects.
   */
  async getCategories(): Promise<RunCategory[]> {

    return await RunCategory.find({
      gameID: this._id
    });

  }

}