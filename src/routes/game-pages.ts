import { Router, Response } from "express";
import gamePageIDRouter from "./game-pages/[gamePageID].js";
import database from "#utils/database-generator.js";
import authenticator, { Account, defaultPermissions } from "#utils/authenticator.js";
import { ObjectId } from "mongodb";

const router = Router();
router.use("/:gamePageID", gamePageIDRouter);

// Gets a game page.
router.get("/", async (request, response) => {

  try {

    // Get all pages from the database.
    const documents = await database.collection("gamePages").find({}).toArray();
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

  if (name.length === 0 || name.length > 255) {

    return response.status(400).json({
      message: "A game page name needs to be at least 1 character and at most 255 characters."
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
    const eventsCollection = database.collection("events");
    const eventEntry = await eventsCollection.findOne({name: "gamePages.create"});
    let eventID = eventEntry?._id;
    if (!eventEntry) {

      eventID = (await eventsCollection.insertOne({name: "gamePages.create"})).insertedId;

    }

    await database.collection("auditLog").insertOne({
      eventID,
      actorID,
      targetID: gamePageID,
      sessionID: response.locals.sessionID
    });

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