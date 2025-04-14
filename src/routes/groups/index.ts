import database from "#utils/database-generator.js";
import { Router } from "express";
import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator, { defaultPermissions } from "#utils/authenticator.js";

const router = Router();

router.post("/", authenticator);
router.post("/", async (request, response) => {

  // Verify permissions.
  const { permissionOverrides, _id: actorID } = response.locals.account;
  if (permissionOverrides?.groups?.create === 0 || (!defaultPermissions.groups.create && !permissionOverrides?.groups?.create)) {

    return response.status(403).json({
      message: "You don't have permission to do that."
    });

  }
  
  // Validate input.
  const { name } = request.body;
  if (typeof(name) !== "string" || name.length < 1 || name.length > 64) {

    return response.status(400).json({
      message: "Group name must be a string that ranges from 1 to 64 characters."
    });

  }

  // Make sure there isn't a similar group name.
  try {

    // Verify that the name doesn't already exist.
    const similarNameFilter = {
      name: new RegExp(`^${name.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "ig")
    };

    if (await database.collection("groups").countDocuments(similarNameFilter) > 0) {

      return response.status(409).json({
        message: "A group with a similar name already exists."
      });

    }

    // Add category metadata to database
    const { insertedId: groupID } = await database.collection("groups").insertOne({name});
    await addToAuditLog("groups.create", actorID, groupID, response.locals.sessionID);

    console.log(`Successfully created group: ${groupID}`);

    await database.collection("groupMembers").insertOne({
      groupID,
      userID: response.locals.account._id
    });
    await addToAuditLog("groups.join", actorID, groupID, response.locals.sessionID);

    // Return the info to the client.
    return response.status(201).json({groupID});

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });
    
  }

});

export default router;
