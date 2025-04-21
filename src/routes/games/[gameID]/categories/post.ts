import authenticator from "#utils/authenticator.js";
import { Request, Router } from "express";
import addToAuditLog from "#utils/addToAuditLog.js";
import { AuthenticatedResponse } from "#classes/User.js";
import RunCategory from "#classes/RunCategory.js";
import Game from "#classes/Game.js";
import { GameNotFoundError } from "#classes/errors/GameNotFoundError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import Permission, { PermissionAccessLevel } from "#classes/Permission.js";

const createCategoryRouter = Router({ mergeParams: true });

// Create a run category.
createCategoryRouter.post("/", authenticator);
createCategoryRouter.post("/", async (request: Request<{ gameID: string }>, response: AuthenticatedResponse) => {
  
  try {

    // Verify permissions.
    // TODO: Check game page permissions.
    const { user } = response.locals;
    const permission = await Permission.getFromHierarchicalName("games.categories.create");
    user.verifyPermission(permission, PermissionAccessLevel.USER);

    // Restrict the category name to a reasonable length.
    const categoryName = request.body.name;
    if (typeof(categoryName) !== "string" || request.body.name.length > 64 || request.body.name.length < 1) {

      response.status(400).json({
        message: "Name must be a string that ranges between 1 to 64 characters."
      });
      return;

    }

    // Verify that the name doesn't already exist.
    const similarNameFilter = {
      name: new RegExp(`^${categoryName.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "ig")
    };

    if (await RunCategory.collection.countDocuments(similarNameFilter) > 0) {

      response.status(409).json({
        message: "A category with a similar name already exists in that game page."
      });
      return;

    }

    // Add category metadata to database
    const game = await Game.getFromID(request.params.gameID);
    const category = await RunCategory.create({
      name: categoryName,
      gameID: game._id
    });

    console.log(`Successfully created run category: ${category._id}`);

    // Add the event to the audit log.
    await addToAuditLog("games.categories.create", user._id, category._id, user.getSessionID());

    // Return the info to the client.
    response.status(201).json(category);

  } catch (error: unknown) {

    if (error instanceof GameNotFoundError || error instanceof InternalServerError || error instanceof NoPermissionError) {
        
      response.status(error.statusCode).json({
        message: error.message
      });

    } else {

      console.warn(error);

      const internalServerError = new InternalServerError();
      response.status(internalServerError.statusCode).json({
        message: internalServerError.message
      });

    }
    
  }

});

export default createCategoryRouter;
