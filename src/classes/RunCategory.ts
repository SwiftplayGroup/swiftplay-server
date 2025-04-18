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
import { CategoryNotFoundError } from "./errors/CategoryNotFoundError.js";

export type RunCategoryProperties = {
  _id: ObjectId;
  name: string;
  description?: string;
  gameID: ObjectId;
}

export default class RunCategory {

  readonly _id: ObjectId;
  gameID: ObjectId;
  description?: string;
  name: string;

  static collection = database.collection<RunCategoryProperties>("runCategories");

  constructor(properties: RunCategoryProperties) {

    this._id = properties._id;
    this.name = properties.name;
    this.description = properties.description;
    this.gameID = properties.gameID;

  }

  /**
   * Creates a category based on the given properties.
   * @param properties Properties to create the category.
   * @returns A newly created RunCategory object.
   */
  static async create(properties: Omit<RunCategoryProperties, "_id">): Promise<RunCategory> {

    const data = {
      ...properties,
      _id: new ObjectId()
    };

    this.collection.insertOne(data);

    return new this(data);

  }

  /**
   * Returns a Game object based on the given thread ID. 
   * @param categoryID The game ID to search for.
   * @returns A Game object.
   * @throws {CategoryNotFoundError} The game must exist.
   */
  static async getFromID(categoryID: ObjectId | string): Promise<RunCategory> {

    try {

      const data = await this.collection.findOne({
        _id: new ObjectId(categoryID)
      });

      if (!data) {

        throw new CategoryNotFoundError(categoryID);

      }

      return new this(data);

    } catch (error) {

      if (isBSONError(error)) {
      
        throw new CategoryNotFoundError(categoryID);
  
      } else {

        throw error;

      }

    }

  }

  static async find(filter: Filter<RunCategoryProperties> = {}): Promise<RunCategory[]> {

    const categories = [];

    for (const categoryData of await this.collection.find(filter).toArray()) {

      const category = new this(categoryData);
      categories.push(category);

    }

    return categories;

  }

  /**
   * Deletes the category and moves all associated runs to the default category.
   */
  async delete() {

    // Move all associated runs to the default category.
    await Run.collection.updateMany({
      categoryID: this._id
    }, {
      $unset: {
        categoryID: 1
      }
    });

    // Delete the category.
    await RunCategory.collection.deleteOne({
      _id: this._id
    });

  }
  
  /**
   * Updates a category based on the given properties.
   * @param updateFilter A MongoDB filter object
   */
  async edit(updateFilter: UpdateFilter<RunCategoryProperties>): Promise<void> {

    RunCategory.collection.updateOne({
      _id: this._id
    }, updateFilter);

  }

}