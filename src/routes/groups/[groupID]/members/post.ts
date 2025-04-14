/**
 * Add a member to a group. Requires groups.members.join permission to add self; requires groups.members.add permission to add others.
 * 
 * Programmer: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Request, Router } from "express";
import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import User, { AuthenticatedResponse } from "#classes/User.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import Group from "#classes/Group.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { NotFoundError } from "#classes/errors/NotFoundError.js";

const addMemberRouter = Router({mergeParams: true});

addMemberRouter.post("/", authenticator);
addMemberRouter.post("/", async (request: Request<{groupID: string}, unknown, {userIDs?: string[]}>, response: AuthenticatedResponse) => {

  try {

    // Verify group exists.
    const group = await Group.getFromID(request.params.groupID);

    // Verify permissions.
    const { user } = response.locals;
    const { userIDs } = request.body;
    const users = [];
    if (userIDs) {

      if (!(userIDs instanceof Array)) {

        throw new BadRequestError("userIDs must be an array of active user IDs.");

      }

      for (const userID of userIDs) {

        if (typeof(userID) !== "string") {

          throw new BadRequestError("userIDs must be an array of active user IDs.");

        }

        const newMemberUser = await User.getFromID(userID);
        user.verifyPermission(newMemberUser._id.equals(user._id) ? "groups.members.join" : "groups.members.add", 1);
        users.push(newMemberUser);

      }

    } else {

      users.push(user);
      user.verifyPermission("groups.members.join", 1);

    }

    for (const newMemberUser of users) {

      await group.addMember(newMemberUser._id);
      addToAuditLog(newMemberUser._id.equals(user._id) ? "groups.members.join" : "groups.members.add", user._id, newMemberUser._id, user.getSessionID());
      console.log(`Successfully added User ${newMemberUser._id} to group ${group._id}`);

    }

    // Return the info to the client.
    return response.status(201).json({
      success: true
    });

  } catch (error: unknown) {

    if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof NoPermissionError) {

      return response.status(error.statusCode).json({
        message: error.message
      });

    } else {
      
      console.error(error);

      return response.status(500).json({
        message: "Something bad happened on our end. Try again later."
      });

    }
    
  }

});

export default addMemberRouter;
