import authenticator from "#utils/authenticator.js";
import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import addToAuditLog from "#utils/addToAuditLog.js";
import { AuthenticatedResponse } from "#classes/User.js";

const createCategoryRouter = Router({ mergeParams: true });

// Create a run category.
createCategoryRouter.post("/", authenticator);
createCategoryRouter.post("/", async (request: Request<{ gamePageID: string }>, response: AuthenticatedResponse) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { user } = response.locals;
  user.verifyPermission("gamePages.categories.create", 1);

  // Restrict the category name to a reasonable length.
  const categoryName = request.body.name;
  if (typeof(categoryName) !== "string" || request.body.name.length > 64 || request.body.name.length < 1) {

    response.status(400).json({
      message: "Name must be a string that ranges between 1 to 64 characters."
    });
    return;

  }
  
  try {

    // Verify that the name doesn't already exist.
    const similarNameFilter = {
      name: new RegExp(`^${categoryName.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "ig")
    };

    if (await database.collection("runCategories").countDocuments(similarNameFilter) > 0) {

      response.status(409).json({
        message: "A category with a similar name already exists in that game page."
      });
      return;

    }

    // Add category metadata to database
    const { insertedId: categoryID } = await database.collection("runCategories").insertOne({name: categoryName});
    console.log(`Successfully created run category: ${categoryID}`);

    // Add the event to the audit log.
    await addToAuditLog("gamePages.categories.create", user._id, categoryID, user.getSessionID());

    // Return the info to the client.
    response.status(201).json({categoryID});

  } catch (error: unknown) {

    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });
    
  }

});

export default createCategoryRouter;
