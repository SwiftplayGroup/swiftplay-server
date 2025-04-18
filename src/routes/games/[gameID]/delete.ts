import { Request, Router } from "express";
import authenticator from "#utils/authenticator.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import { AuthenticatedResponse } from "#classes/User.js";
import { GameNotFoundError } from "#classes/errors/GameNotFoundError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import Game from "#classes/Game.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import Permission, { PermissionAccessLevel } from "#classes/Permission.js";

const deleteGamePageRouter = Router({ mergeParams: true });

deleteGamePageRouter.delete("/", authenticator);
deleteGamePageRouter.delete("/", async (request: Request<{ gameID: string }>, response: AuthenticatedResponse) => {

  try {

    // Verify permissions.
    // TODO: Check game page permissions.
    const { user } = response.locals;
    const permission = await Permission.getFromHierarchicalName("games.delete");
    user.verifyPermission(permission, PermissionAccessLevel.USER);

    // Delete game page.
    const game = await Game.getFromID(request.params.gameID);
    await game.delete();

    // Add to audit log.
    await addToAuditLog("gamePages.delete", user._id, game._id, user.getSessionID());

    response.status(204).json({
      success: true
    });

  } catch (error: unknown) {

    if (error instanceof BadRequestError || error instanceof GameNotFoundError || error instanceof InternalServerError || error instanceof NoPermissionError) {

      response.status(error.statusCode).json({
        message: error.message
      });

    } else {

      console.error(error);

      const internalServerError = new InternalServerError();
      response.status(internalServerError.statusCode).json({
        message: internalServerError.message
      });

    }

  }

});

export default deleteGamePageRouter;
