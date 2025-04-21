import { Router, Request } from "express";
import authenticator from "#utils/authenticator.js";
import User from "#classes/User.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Permission, { PermissionAccessLevel } from "#classes/Permission.js";
import { GameNotFoundError } from "#classes/errors/GameNotFoundError.js";
import Game from "#classes/Game.js";

const editRunRouter = Router({ mergeParams: true });

editRunRouter.patch("/", authenticator);
editRunRouter.patch("/", async (request: Request<{ gameID: string }>, response) => {

  try {

    const actor: User = response.locals.user;
    let targetGame = await Game.getFromID(request.params.gameID);
    const editGamePermission = await Permission.getFromHierarchicalName("games.edit");
    actor.verifyPermission(editGamePermission, PermissionAccessLevel.USER);

    // Verify properties.
    const unsetProperties: {[key: string]: 1} = {};
    for (const key of Object.keys(request.body)) {

      const keyChecks: {[key: string]: (value: unknown) => unknown} = {
        approval: async (approval: unknown) => {

          // Make sure the user can do this.
          const verifyRunsPermission = await Permission.getFromHierarchicalName("games.approve");
          actor.verifyPermission(verifyRunsPermission, PermissionAccessLevel.USER);

          if (approval === null) {

            unsetProperties.approval = 1;

          } else if (typeof(approval) === "object" && !(approval instanceof Array)) {

            const validatedVerification: Record<string, unknown> = {};

            for (const property of Object.keys(approval)) {

              const validators: {[property: string]: (property: unknown) => unknown} = {
                ownerID: async (ownerID: unknown) => {

                  // Verify user exists.
                  if (typeof(ownerID) !== "string") {

                    throw new BadRequestError("ownerID must be a user ID.");

                  }

                  const owner = await User.getFromID(ownerID);

                  return owner._id;

                }
              };

              if (!(property in validators)) {

                throw new BadRequestError(`${key} isn't a valid verification property.`);

              }

              const validator = validators[property];
              const validatedValue = await validator(approval[property as keyof typeof approval]);
              validatedVerification[property] = validatedValue;

            }

            validatedVerification.timestamp = new Date();

            return validatedVerification;

          } else {

            throw new BadRequestError("Verification must be null or an object.");

          }

        },
        name: (value: unknown) => {
          if (typeof(value) !== "string") throw new BadRequestError("Name must be a string.");
          if (value.length > 128 || value.length < 1) throw new BadRequestError("Name must be between 1 to 128 characters.");
          return value;
        }
      };

      const keyCheck = keyChecks[key];

      if (!keyCheck) throw new BadRequestError(`${key} is not a valid key of a game.`);
      
      const newValue = await keyCheck(request.body[key]);
      if (newValue !== undefined) {

        request.body[key] = newValue;

      } else {

        delete request.body[key];

      }

    }

    targetGame = await targetGame.edit(
      {
        $set: request.body,
        $unset: unsetProperties
      },
    );

    await addToAuditLog("games.edit", actor._id, targetGame._id, actor.getSessionID());

    response.status(200).json(await targetGame.getExtendedProperties());

  } catch (error: unknown) {

    if (error instanceof GameNotFoundError || error instanceof NoPermissionError || error instanceof InternalServerError || error instanceof BadRequestError) {
                            
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

export default editRunRouter;
