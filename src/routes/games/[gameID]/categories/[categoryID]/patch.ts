import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import { Request, Router } from "express";
import { AuthenticatedResponse } from "#classes/User.js";
import RunCategory from "#classes/RunCategory.js";
import { CategoryNotFoundError } from "#classes/errors/CategoryNotFoundError.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { GameNotFoundError } from "#classes/errors/GameNotFoundError.js";
import Permission, { PermissionAccessLevel } from "#classes/Permission.js";

const editCategoryRouter = Router({ mergeParams: true });

editCategoryRouter.patch("/", authenticator);
editCategoryRouter.patch("/", async (request: Request<{ categoryID: string }>, response: AuthenticatedResponse) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { user } = response.locals;
  const permission = await Permission.getFromHierarchicalName("games.categories.edit");
  user.verifyPermission(permission, PermissionAccessLevel.USER);

  // Verify properties.
  for (const key of Object.keys(request.body)) {

    const keyChecks: {[key: string]: (value: unknown) => boolean | string} = {
      name: (value: unknown) => (
        typeof(value) !== "string" ? "Name must be a string." : (
          value.length > 64 || value.length < 1 ? "Name must be between 1 to 64 characters." : true
        )
      ),
      description: (value: unknown) => (
        value === undefined ? true : (
          typeof(value) !== "string" ? "Description must be a string." : (
            value.length > 1024 || value.length < 0 ? "Description must be between 0 to 1024 characters." : true
          )
        )
      )
    };

    const keyCheck = keyChecks[key];
    if (!keyCheck) {

      response.status(400).json({
        message: `${key} is an invalid property.`
      });
      return;

    }
    
    const responseMessage = keyCheck(request.body[key]);
    if (typeof(responseMessage) !== "boolean") {

      response.status(400).json({
        message: responseMessage
      });
      return;

    }

  }

  try {
    
    const category = await RunCategory.getFromID(request.params.categoryID);
    await category.edit({
      $set: request.body
    });

    await addToAuditLog("games.categories.edit", user._id, category._id, user.getSessionID());

    response.status(200).json({
      success: true
    });

  } catch (error: unknown) {

    if (error instanceof BadRequestError || error instanceof GameNotFoundError || error instanceof CategoryNotFoundError) {

      response.status(error.statusCode).json({
        message: error.message,
      });

    } else {

      console.log(error);

      response.status(500).json({
        message: "Something bad happened on our side. Try again later.",
      });

    }
    
  }

});

export default editCategoryRouter;
