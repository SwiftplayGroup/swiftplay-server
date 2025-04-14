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
import getAuthenticatedMember from "#utils/getAuthenticatedMember.js";
import { AuthenticatedResponse } from "#classes/User.js";

const router = Router();

router.delete("/", authenticator);
router.delete("/", getAuthenticatedMember);
router.delete("/", async (request: Request<{groupID: string}>, response: AuthenticatedResponse) => {

  // Verify permissions.
  const { user } = response.locals;
  user.verifyPermission("groups.delete", 1);

  // Make sure there isn't a similar group name.
  try {

    // Delete group data from database
    const groupID = new ObjectId(request.params.groupID);
    await database.collection("groupMembers").deleteMany({groupID});
    await database.collection("groups").deleteOne({_id: groupID});

    await addToAuditLog("groups.delete", user._id, groupID, user.getSessionID());

    console.log(`Successfully deleted group: ${groupID}`);

    // Return the info to the client.
    return response.status(204).json({groupID});

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });
    
  }

});

export default router;
