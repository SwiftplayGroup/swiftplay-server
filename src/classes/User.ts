/**
 * A class representing a user.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import database from "#utils/database-generator.js";
import { Filter, ObjectId, UpdateFilter } from "mongodb";
import { NoPermissionError } from "./errors/NoPermissionError.js";
import { Response } from "express";
import { UserNotFoundError } from "./errors/UserNotFoundError.js";
import Run from "./Run.js";
import { createHash } from "crypto";
import Permission, { PermissionAccessLevel } from "./Permission.js";

export type PermissionOverride = {
  [permissionIDString: string]: number;
}

export type UserProperties = {
  _id: ObjectId;
  avatarURL?: string;
  username: string;
  permissionOverrides?: PermissionOverride;
  favoriteRunID?: ObjectId;
}

export type PrivateUserProperties = {
  password: string;
  emailAddress: string;
}

export type AuthenticatedResponse<T = Record<string, unknown>> = Response<unknown, {user: User} & T>;

export default class User {

  readonly _id: ObjectId;
  avatarURL?: string;
  username: string;
  permissionOverrides?: PermissionOverride;
  favoriteRunID?: ObjectId;
  #sessionID?: ObjectId;
  #password: string;
  #emailAddress: string;

  static collection = database.collection<UserProperties & PrivateUserProperties>("users");

  constructor(properties: UserProperties & PrivateUserProperties) {

    this._id = properties._id;
    this.username = properties.username;
    this.favoriteRunID = properties.favoriteRunID;
    this.#password = properties.password;
    this.#emailAddress = properties.emailAddress;
    this.permissionOverrides = properties.permissionOverrides;

    if (this.#emailAddress) {

      const avatarHash = createHash("sha256").update(this.#emailAddress).digest("hex");
      this.avatarURL = `https://gravatar.com/avatar/${avatarHash}`;

    }

  }

  static async getFromID(userID: ObjectId | string): Promise<User> {

    try {

      const data = await this.collection.findOne({_id: new ObjectId(userID)});
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

  static async find(filter: Filter<UserProperties & PrivateUserProperties> = {}): Promise<User[]> {
  
    const users = [];

    for (const userData of await this.collection.find(filter).toArray()) {

      const user = new User(userData);
      users.push(user);

    }

    return users;

  }

  getSessionID(): ObjectId | undefined {

    return this.#sessionID;

  }

  getEncryptedPassword(): string {

    return this.#password;

  }

  getEmailAddress(): string {

    return this.#emailAddress;

  }

  /**
   * Updates a run based on the given properties.
   * @param updateFilter A MongoDB filter object
   */
  async edit(updateFilter: UpdateFilter<UserProperties>): Promise<void> {

    User.collection.updateOne({
      _id: this._id
    }, updateFilter);

  }

  /**
   * Gets a list of runs that the user owns.
   * @returns A list of Run objects.
   */
  async getRuns(): Promise<Run[]> {

    return await Run.find({
      ownerID: this._id
    });

  }

  setSessionID(sessionID: ObjectId) {

    this.#sessionID = sessionID;

  }

  /**
   * Verifies that the user has a specific permission.
   * @param permission
   * @param requiredPermissionLevel
   */
  verifyPermission(permission: Permission, requiredAccessLevel: PermissionAccessLevel) {

    const overrideAccessLevel = this.permissionOverrides?.[permission._id.toString()];

    if (overrideAccessLevel ? overrideAccessLevel < requiredAccessLevel : permission.defaultAccessLevel < requiredAccessLevel) {
  
      throw new NoPermissionError();
  
    }
  
  
  }

}