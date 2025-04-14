import authenticator, { defaultPermissions } from "#utils/authenticator.js";
import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";
import categoryIDRouter from "./[categoryID]/index.js";
import addToAuditLog from "#utils/addToAuditLog.js";

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
  const { permissionOverrides, _id: actorID } = response.locals.account;
  if (permissionOverrides?.gamePages?.categories?.create === 0 || (!defaultPermissions.gamePages.categories.create && !permissionOverrides?.gamePages?.categories?.create)) {

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
  
  try {

    // Verify that the name doesn't already exist.
    const similarNameFilter = {
      name: new RegExp(`^${categoryName.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "ig")
    };

    if (await database.collection("runCategories").countDocuments(similarNameFilter) > 0) {

      return response.status(409).json({
        message: "A category with a similar name already exists in that game page."
      });

    }

    // Add category metadata to database
    const { insertedId: categoryID } = await database.collection("runCategories").insertOne({name: categoryName});
    console.log(`Successfully created run category: ${categoryID}`);

    // Add the event to the audit log.
    await addToAuditLog("gamePages.categories.create", actorID, categoryID, response.locals.sessionID);

    // Return the info to the client.
    return response.status(201).json({categoryID});

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });
    
  }

});

router.use("/:categoryID", categoryIDRouter);

export default router;
