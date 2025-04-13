import { Router } from "express";
import gamePageIDRouter from "./game-pages/[gamePageID].js";
import database from "#utils/database-generator.js";
import authenticator from "#utils/authenticator.js";

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
router.post("/", async (request, response) => {

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

    const { insertedId: gamePageID } = await database.collection("gamePages").insertOne({name});
    console.log(`Successfully created a game page: ${gamePageID}`);

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