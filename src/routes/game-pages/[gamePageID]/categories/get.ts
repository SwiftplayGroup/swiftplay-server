import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";

const getCategoriesRouter = Router({ mergeParams: true });

getCategoriesRouter.get("/", async (request: Request<{ gamePageID: string }>, response) => {
  // Verify that the user provides a valid game page ID. If anyone is invalid, return a 404 error.
  let objectID;
  try {
    objectID = new ObjectId(request.params.gamePageID);
  } catch (error: unknown) {
    console.log(error);
    return response.status(404).json({
      message: "Game page not found.",
    });
  }

  const document = await database.collection("gamePages").findOne({
    _id: objectID,
  });

  if (!document) {
    return response.status(404).json({
      message: "Game page not found.",
    });
  }

  // Rename sensitive keys.
  const page: { [key: string]: unknown } = {};
  for (const key of Object.keys(document)) {
    let newKey = key;
    if (newKey === "_id") {
      newKey = "id";
    }

    page[newKey] = document[key];
  }

  return response.json(page);
});

export default getCategoriesRouter;
