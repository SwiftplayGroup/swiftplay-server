import authenticator, { defaultPermissions } from "#utils/authenticator.js";
import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";
import categoryIDRouter from "./categories/[categoryID].js";

const router = Router({ mergeParams: true });

router.get("/", async (request: Request<{ gamePageID: string }>, response) => {
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

// Create a run category.
router.post("/", authenticator);
router.post("/", async (request: Request<{ gamePageID: string }>, response) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { permissionOverwrites, _id: actorID } = response.locals.accountData;
  if (permissionOverwrites?.gamePages?.categories?.create === false || (!defaultPermissions.gamePages.categories.create && !permissionOverwrites?.gamePages?.categories?.create)) {

    return response.status(403).json({
      message: "You don't have permission to do that."
    });

  }

  // Restrict the category name to a reasonable length.
  const categoryName = request.body.name;
  if (typeof(categoryName) !== "string" || request.body.name.length > 64 || request.body.name.length < 1) {

    return response.status(400).json({
      message: "Name must be a string that ranges between 1 to 64 characters."
    });

  }

  // Verify that the name doesn't already exist.
  try {

    const similarNameFilter = {
      name: new RegExp(`^${categoryName.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "ig")
    }

    if (await database.collection("gamePages").countDocuments(similarNameFilter) > 0) {

      return response.status(409).json({
        message: "A category with a similar name already exists in that game page."
      });

    }

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });
    
  }

  console.log(`Successfully created run category: `);

  return response.status(201).json({
    success: true
  })

});

router.use("/:categoryID", categoryIDRouter);

export default router;
