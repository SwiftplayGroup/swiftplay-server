import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import { Request, Router } from "express";
import { AuthenticatedResponse } from "#classes/User.js";
import RunCategory from "#classes/RunCategory.js";
import { CategoryNotFoundError } from "#classes/errors/CategoryNotFoundError.js";
import Permission, { PermissionAccessLevel } from "#classes/Permission.js";

const deleteCategoryRouter = Router({ mergeParams: true });

// Delete a run category.
deleteCategoryRouter.delete("/", authenticator);
deleteCategoryRouter.delete("/", async (request: Request<{ categoryID: string }>, response: AuthenticatedResponse) => {

  try {

    // Verify permissions.
    // TODO: Check game permissions.
    const { user } = response.locals;
    const permission = await Permission.getFromHierarchicalName("games.categories.delete");
    user.verifyPermission(permission, PermissionAccessLevel.USER);

    // Move all runs to the default category.
    const category = await RunCategory.getFromID(request.params.categoryID);
    await category.delete();

    console.log(`Successfully deleted a run category: ${category._id}`);

    await addToAuditLog("gamePages.categories.delete", user._id, category._id, user.getSessionID());

    response.status(204).json({
      success: true
    });

  } catch (error: unknown) {

    if (error instanceof CategoryNotFoundError) {
    
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

export default deleteCategoryRouter;
