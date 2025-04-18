/**
 * Delete a group from the database.
 * 
 * Programmer: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import { ObjectId } from "mongodb";
import { AuthenticatedResponse } from "#classes/User.js";
import { GroupMemberNotFoundError } from "#classes/errors/GroupMemberNotFoundError.js";
import GroupMember from "#classes/GroupMember.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import Permission, { PermissionAccessLevel } from "#classes/Permission.js";

const router = Router({mergeParams: true});

router.delete("/", authenticator);
router.delete("/", async (request: Request<{groupID: string}>, response: AuthenticatedResponse) => {

  try {

    // Verify permissions.
    const { user } = response.locals;
    try {

      const member = await GroupMember.getFromUserID(new ObjectId(request.params.groupID), user._id);
      if (!member.isAdmin) {

        throw new NoPermissionError();

      }

    } catch (error) {

      if (error instanceof NoPermissionError || error instanceof GroupMemberNotFoundError) {

        // Check if the user is a global moderator.
        const permission = await Permission.getFromHierarchicalName("groups.delete");
        user.verifyPermission(permission, PermissionAccessLevel.USER);

      } else {

        throw error;

      }

    }

    // Delete group data from database
    const groupID = new ObjectId(request.params.groupID);
    await database.collection("groupMembers").deleteMany({groupID});
    await database.collection("groups").deleteOne({_id: groupID});

    await addToAuditLog("groups.delete", user._id, groupID, user.getSessionID());

    console.log(`Successfully deleted group: ${groupID}`);

    // Return the info to the client.
    response.status(204).json({groupID});

  } catch (error: unknown) {

    if (error instanceof NoPermissionError) {

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

export default router;
