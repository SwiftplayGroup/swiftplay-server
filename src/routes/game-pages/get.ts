import { Router } from "express";
import database from "#utils/database-generator.js";

const getGamePagesRouter = Router({mergeParams: true});

getGamePagesRouter.get("/", async (request, response) => {

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

    response.json(pages);

  } catch (error: unknown) {

    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });

  }

});

export default getGamePagesRouter;
