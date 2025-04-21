/**
 * A class representing a permission.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Filter, ObjectId, UpdateFilter } from "mongodb";
import database from "#utils/database-generator.js";
import isBSONError from "#utils/isBSONError.js";
import { PermissionNotFoundError } from "./errors/PermissionNotFoundError.js";
import User from "./User.js";

export enum PermissionAccessLevel {
  DENIED,
  USER,
  ADMIN
}

export type PermissionProperties = {
  _id: ObjectId;
  name: string;
  description: string;
  hierarchicalName: string;
  defaultAccessLevel: PermissionAccessLevel;
}

export type KnownHierarchicalName = (
  "games.categories.create" | 
  "games.categories.delete" | 
  "games.categories.edit" | 
  "games.create" | 
  "games.delete" | 
  "games.edit" |
  "games.runs.create" |
  "games.runs.remove" |
  "games.runs.verify" |
  "groups.create" |
  "groups.delete" |
  "groups.members.add" |
  "groups.members.join" |
  "groups.members.leave" |
  "groups.members.remove"
)

export default class Permission {

  readonly _id: PermissionProperties["_id"];
  name: PermissionProperties["name"];
  description: PermissionProperties["description"];
  hierarchicalName: PermissionProperties["hierarchicalName"];
  defaultAccessLevel: PermissionProperties["defaultAccessLevel"];

  static collection = database.collection<PermissionProperties>("permissions");

  constructor(properties: PermissionProperties) {

    this._id = properties._id;
    this.name = properties.name;
    this.description = properties.description;
    this.defaultAccessLevel = properties.defaultAccessLevel;
    this.hierarchicalName = properties.hierarchicalName;

  }

  /**
   * Creates a permission based on the given properties.
   * @param properties Properties to create the category.
   * @returns A newly created Permission object.
   */
  static async create(properties: Omit<PermissionProperties, "_id">): Promise<Permission> {

    const data = {
      ...properties,
      _id: new ObjectId()
    };

    this.collection.insertOne(data);

    return new this(data);

  }

  /**
   * Returns a Permission object based on the given thread ID. 
   * @param categoryID The permission ID to search for.
   * @returns A Permission object.
   * @throws {PermissionNotFoundError} The game must exist.
   */
  static async getFromID(categoryID: ObjectId | string): Promise<Permission> {

    try {

      const data = await this.collection.findOne({
        _id: new ObjectId(categoryID)
      });

      if (!data) {

        throw new PermissionNotFoundError(categoryID);

      }

      return new this(data);

    } catch (error) {

      if (isBSONError(error)) {
      
        throw new PermissionNotFoundError(categoryID);
  
      } else {

        throw error;

      }

    }

  }

  /**
   * Returns a Permission object based on the given name. 
   * @param permissionName The permission name to search for.
   * @returns A Permission object.
   * @throws {CategoryNotFoundError} The game must exist.
   */
  static async getFromHierarchicalName(hierarchicalName: KnownHierarchicalName): Promise<Permission>
  static async getFromHierarchicalName(hierarchicalName: string): Promise<Permission> {

    const data = await this.collection.findOne({hierarchicalName});

    if (!data) throw new PermissionNotFoundError(hierarchicalName);

    return new this(data);

  }

  static async initializeDefaultPermissions() {

    const defaultPermissions: Omit<PermissionProperties, "_id">[] = [
      {
        name: "Create run categories",
        hierarchicalName: "games.categories.create",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Delete run categories",
        hierarchicalName: "games.categories.delete",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Edit run categories",
        hierarchicalName: "games.categories.edit",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Create game pages",
        hierarchicalName: "games.create",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.USER
      },
      {
        name: "Delete game pages",
        hierarchicalName: "games.delete",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Edit game pages",
        hierarchicalName: "games.edit",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Create runs",
        hierarchicalName: "games.runs.create",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.USER
      },
      {
        name: "Remove runs",
        hierarchicalName: "games.runs.remove",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Verify runs",
        hierarchicalName: "games.runs.verify",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Create groups",
        hierarchicalName: "groups.create",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.USER
      },
      {
        name: "Delete groups",
        hierarchicalName: "groups.delete",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Add anyone to any group",
        hierarchicalName: "groups.members.add",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Join groups",
        hierarchicalName: "groups.members.join",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.USER
      },
      {
        name: "Remove anyone from any group",
        hierarchicalName: "groups.members.remove",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.DENIED
      },
      {
        name: "Leave groups",
        hierarchicalName: "groups.members.remove",
        description: "",
        defaultAccessLevel: PermissionAccessLevel.USER
      },
    ];

    for (const defaultPermission of defaultPermissions) {

      await this.collection.updateOne({
        hierarchicalName: defaultPermission.hierarchicalName
      }, {
        $set: defaultPermission
      }, {
        upsert: true
      });

    }

  }

  static async find(filter: Filter<PermissionProperties> = {}): Promise<Permission[]> {

    const permissions = [];

    for (const data of await this.collection.find(filter).toArray()) {

      const permission = new this(data);
      permissions.push(permission);

    }

    return permissions;

  }

  /**
   * Deletes the permission and removes it from any user that has it.
   */
  async delete() {

    // Move all associated runs to the default category.
    await User.collection.updateMany({
      permissionOverrides: {

      }
    }, {
      $unset: {
        categoryID: 1
      }
    });

    // Delete the category.
    await Permission.collection.deleteOne({
      _id: this._id
    });

  }
  
  /**
   * Updates a category based on the given properties.
   * @param updateFilter A MongoDB filter object
   */
  async edit(updateFilter: UpdateFilter<PermissionProperties>): Promise<void> {

    await Permission.collection.updateOne({
      _id: this._id
    }, updateFilter);

  }

}
