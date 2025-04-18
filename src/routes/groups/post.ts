import database from "#utils/database-generator.js";
import { Router } from "express";
import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import { AuthenticatedResponse } from "#classes/User.js";

const createGroupRouter = Router();

createGroupRouter.post("/", authenticator);
createGroupRouter.post("/", async (request, response: AuthenticatedResponse) => {

  // Verify permissions.
  const { user } = response.locals;
  user.verifyPermission("groups.create", 1);
  
  // Validate input.
  const { name } = request.body;
  if (typeof(name) !== "string" || name.length < 1 || name.length > 64) {

    response.status(400).json({
      message: "Group name must be a string that ranges from 1 to 64 characters."
    });

    return;

  }

  // Make sure there isn't a similar group name.
  try {

    // Verify that the name doesn't already exist.
    const similarNameFilter = {
      name: new RegExp(`^${name.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "ig")
    };

    if (await database.collection("groups").countDocuments(similarNameFilter) > 0) {

      response.status(409).json({
        message: "A group with a similar name already exists."
      });

      return;

    }

    // Add category metadata to database
    const { insertedId: groupID } = await database.collection("groups").insertOne({name});
    await addToAuditLog("groups.create", user._id, groupID, user.getSessionID());

    console.log(`Successfully created group: ${groupID}`);

    await database.collection("groupMembers").insertOne({
      groupID,
      userID: response.locals.user._id
    });
    await addToAuditLog("groups.join", user._id, groupID, user.getSessionID());

    // Return the info to the client.
    response.status(201).json({groupID});

  } catch (error: unknown) {

    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });
    
  }

});

export default createGroupRouter;