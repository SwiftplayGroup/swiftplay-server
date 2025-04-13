import { Router, Response } from "express";
import gamePageIDRouter from "./game-pages/[gamePageID].js";
import database from "#utils/database-generator.js";
import authenticator, { Account, defaultPermissions } from "#utils/authenticator.js";
import { ObjectId } from "mongodb";
import addToAuditLog from "#utils/addToAuditLog.js";

const router = Router();
router.use("/:gamePageID", gamePageIDRouter);

// Gets a game page.
router.get("/", async (request, response) => {

  try {

    // Get game pages from the database.
    const documents = await database.collection("gamePages").find(request.query.name ? {
      name: new RegExp(`${request.query.name}`, "gi")
    } : {}).toArray();
    const pages = [];

    for (const document of documents) {

      // Rename sensitive keys.
      const page: {[key: string]: unknown} = {};
      for (const key of Object.keys(document)) {

        let newKey = key;
        if (newKey === "_id") {

          newKey = "id";

        }

        page[newKey] = document[key];

      }

      pages.push(page);

    }

    return response.json(pages);

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });

  }

});

// Creates a game page.
router.post("/", authenticator);
router.post("/", async (request, response: Response<any, {accountData: Account; sessionID: ObjectId}>) => {

  // Verify permissions.
  const { permissionOverwrites, _id: actorID } = response.locals.accountData;
  if (permissionOverwrites?.gamePages?.create === false || (!defaultPermissions.gamePages.create && !permissionOverwrites?.gamePages?.create)) {

    return response.status(403).json({
      message: "You don't have permission to do that."
    });

  }

  // Verify that a name was provided.
  const { name } = request.body;
  if (!name || typeof(name) !== "string") {

    return response.status(400).json({
      message: "A game page needs a name."
    });

  }

  if (typeof(name) !== "string" || name.length === 0 || name.length > 128) {

    return response.status(400).json({
      message: "Name must be a string that ranges from 1 to 128 characters."
    });

  }

  try {

    // Make sure the name doesn't conflict with any other name.
    const similarNameFilter = {
      name: new RegExp(`^${name.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "ig")
    }

    if (await database.collection("gamePages").countDocuments(similarNameFilter) > 0) {

      return response.status(409).json({
        message: "A game page with a similar name already exists."
      });

    }

    // Add the game page to the database.
    const { insertedId: gamePageID } = await database.collection("gamePages").insertOne({name});
    console.log(`Successfully created a game page: ${gamePageID}`);

    // Add the event to the audit log.
    await addToAuditLog("gamePages.create", actorID, gamePageID, response.locals.sessionID);

    return response.status(201).json({
      id: gamePageID
    });

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });

  }

});

export default router;