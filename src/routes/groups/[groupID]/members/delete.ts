/**
 * Removes a member from a group. Requires groups.members.leave permission to remove self; requires groups.members.remove permission to remove others.
 * 
 * Programmer: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Request, Router } from "express";
import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import { AuthenticatedResponse } from "#classes/User.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import Group from "#classes/Group.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { NotFoundError } from "#classes/errors/NotFoundError.js";
import GroupMember from "#classes/GroupMember.js";

const removeMemberRouter = Router({mergeParams: true});

removeMemberRouter.delete("/", authenticator);
removeMemberRouter.delete("/", async (request: Request<{groupID: string}, unknown, {userIDs?: string[]}>, response: AuthenticatedResponse) => {

  try {

    // Verify group exists.
    const group = await Group.getFromID(request.params.groupID);

    // Verify permissions.
    const { user } = response.locals;
    const { userIDs } = request.body;
    const members = [];
    if (userIDs) {

      if (!(userIDs instanceof Array)) {

        throw new BadRequestError("userIDs must be an array of active user IDs.");

      }

      for (const userID of userIDs) {

        if (typeof(userID) !== "string") {

          throw new BadRequestError("userIDs must be an array of active user IDs.");

        }

        const member = await GroupMember.getFromUserID(group._id, userID);
        user.verifyPermission(member.userID.equals(user._id) ? "groups.members.leave" : "groups.members.remove", 1);
        members.push(member);

      }

    } else {

      const member = await GroupMember.getFromUserID(group._id, user._id);
      user.verifyPermission("groups.members.leave", 1);
      members.push(member);

    }

    for (const member of members) {

      await member.remove();
      addToAuditLog(member.userID.equals(user._id) ? "groups.members.leave" : "groups.members.remove", user._id, member.userID, user.getSessionID());
      console.log(`Successfully removed User ${member.userID} from Group ${group._id}`);

    }

    // Return the info to the client.
    response.status(204).json({
      success: true
    });

  } catch (error: unknown) {

    if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof NoPermissionError) {

      response.status(error.statusCode).json({
        message: error.message
      });

    } else {
      
      console.error(error);

      response.status(500).json({
        message: "Something bad happened on our end. Try again later."
      });

    }
    
  }

});

export default removeMemberRouter;
