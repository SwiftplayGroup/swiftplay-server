/**
 * A class representing a user.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";
import { NoPermissionError } from "./errors/NoPermissionError.js";
import { Response } from "express";
import { UserNotFoundError } from "./errors/UserNotFoundError.js";

export type PermissionOverride = {
  gamePages?: {
    categories?: {
      create?: number,
      delete?: number,
      edit?: number
    },
    create?: number,
    delete?: number,
    edit?: number
  },
  groups?: {
    create?: number,
    delete?: number,
    members?: {
      add?: number;
      join?: number;
      leave?: number;
      remove?: number;
    }
  }
}

export type UserProperties = {
  _id: ObjectId,
  permissionOverrides?: PermissionOverride
}

export type AuthenticatedResponse<T = Record<string, unknown>> = Response<unknown, {user: User} & T>;

type Permission = (
  "accounts.edit" | 
  "gamePages.categories.create" | 
  "gamePages.categories.delete" | 
  "gamePages.categories.edit" | 
  "gamePages.create" | 
  "gamePages.delete" | 
  "gamePages.edit" |
  "gamePages.runs.create" |
  "groups.create" |
  "groups.delete" |
  "groups.members.add" |
  "groups.members.join" |
  "groups.members.leave" |
  "groups.members.remove"
)

export default class User {

  readonly _id: ObjectId;
  permissionOverrides?: PermissionOverride;
  #sessionID?: ObjectId;

  static defaultPermissions = {
    gamePages: {
      categories: {
        create: 0,
        delete: 0,
        edit: 0
      },
      create: 1,
      delete: 0,
      edit: 0
    },
    groups: {
      create: 1,
      delete: 0,
      members: {
        add: 0,
        join: 1,
        leave: 1,
        remove: 0
      }
    }
  };

  constructor(userProperties: UserProperties) {

    this._id = userProperties._id;
    this.permissionOverrides = userProperties.permissionOverrides;

  }

  static async getFromID(userID: ObjectId | string): Promise<User> {

    try {

      const data = await database.collection("users").findOne({_id: new ObjectId(userID)});
      if (!data) {

        throw new UserNotFoundError(userID);

      }
      
      return new User(data);

    } catch (error) {

      if (error instanceof Error && error.name.slice(0, 9) === "BSONError") {

        throw new UserNotFoundError(userID);
  
      } else {

        throw error;

      }

    }

  }

  getSessionID(): ObjectId | undefined {

    return this.#sessionID;

  }

  setSessionID(sessionID: ObjectId) {

    this.#sessionID = sessionID;

  }

  /**
   * Verifies that the user has a specific permission.
   * @param permissionName
   * @param requiredPermissionLevel
   */
  verifyPermission(permissionName: Permission, requiredPermissionLevel: 0 | 1 | 2) {

    const permissionTree = permissionName.split(".");
    type SelectedPermission = {[key: string]: number | SelectedPermission};
    let selectedDefaultPermissionObject: SelectedPermission = User.defaultPermissions;
    type SelectedPermissionOverride = {[key: string]: number | SelectedPermissionOverride | undefined};
    let selectedOverridePermissionObject: SelectedPermissionOverride | undefined = this.permissionOverrides;
    let defaultPermissionLevel = 0;
    let overridePermissionLevel = null;
    for (const permission of permissionTree) {

      if (typeof(selectedDefaultPermissionObject[permission]) == "number") {

        defaultPermissionLevel = selectedDefaultPermissionObject[permission];

      } else {

        selectedDefaultPermissionObject = selectedDefaultPermissionObject[permission];

      }

      if (selectedOverridePermissionObject?.[permission]) {

        if (typeof(selectedOverridePermissionObject[permission]) == "number") {

          overridePermissionLevel = selectedOverridePermissionObject[permission];
  
        } else {
  
          selectedOverridePermissionObject = selectedOverridePermissionObject[permission];
  
        }

      } else {

        overridePermissionLevel = null;

      }

    }

    if (typeof(overridePermissionLevel) === "number" ? overridePermissionLevel < requiredPermissionLevel : defaultPermissionLevel < requiredPermissionLevel) {
  
      throw new NoPermissionError();
  
    }
  
  
  }

}