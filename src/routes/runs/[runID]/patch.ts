import { Router, Request } from "express";
import authenticator from "#utils/authenticator.js";
import User from "#classes/User.js";
import Run from "#classes/Run.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { RunNotFoundError } from "#classes/errors/RunNotFoundError.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Permission, { PermissionAccessLevel } from "#classes/Permission.js";

const editRunRouter = Router({ mergeParams: true });

editRunRouter.patch("/", authenticator);
editRunRouter.patch("/", async (request: Request<{ runID: string }>, response) => {

  try {

    const actor: User = response.locals.user;
    let targetRun = await Run.getFromID(request.params.runID);

    // Verify properties.
    const unsetProperties: {[key: string]: 1} = {};
    for (const key of Object.keys(request.body)) {

      const youtubeRegex = /^[^"&?/\s]{11}$/gi;
      const keyChecks: {[key: string]: (value: unknown) => unknown} = {
        verification: async (verification: unknown) => {

          // Make sure the user can do this.
          const verifyRunsPermission = await Permission.getFromHierarchicalName("games.runs.verify");
          actor.verifyPermission(verifyRunsPermission, PermissionAccessLevel.USER);

          if (verification === null) {

            unsetProperties.verification = 1;

          } else if (typeof(verification) === "object" && !(verification instanceof Array)) {

            const validatedVerification: Record<string, unknown> = {};

            for (const property of Object.keys(verification)) {

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
              const validatedValue = await validator(verification[property as keyof typeof verification]);
              validatedVerification[property] = validatedValue;

            }

            validatedVerification.timestamp = new Date();

            return validatedVerification;

          } else {

            throw new BadRequestError("Verification must be null or an object.");

          }

        },
        removal: async (removal: unknown) => {

          // Make sure the user can do this.
          const verifyRunsPermission = await Permission.getFromHierarchicalName("games.runs.remove");
          actor.verifyPermission(verifyRunsPermission, PermissionAccessLevel.USER);

          if (removal === null) {

            unsetProperties.removal = 1;

          } else if (typeof(removal) === "object" && !(removal instanceof Array)) {

            const validatedRemoval: Record<string, unknown> = {};

            for (const property of Object.keys(removal)) {

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

                throw new BadRequestError(`${key} isn't a valid removal property.`);

              }

              const validator = validators[property];
              const validatedValue = await validator(removal[property as keyof typeof removal]);
              validatedRemoval[property] = validatedValue;

            }

            validatedRemoval.timestamp = new Date();

            return validatedRemoval;

          } else {

            throw new BadRequestError("Verification must be null or an object.");

          }

        },
        durationMilliseconds: (value: unknown) => {
          
          if (typeof (value) !== "number") {

            throw new BadRequestError("durationMilliseconds must be a number.");

          }

          return value;
            
        },
        youtubeWatchID: (value: unknown) => {
          
          if (typeof (value) !== "string" || !youtubeRegex.test(value)) {

            throw new BadRequestError("youtubeWatchID must be a YouTube watch ID.");

          }

          return value;

        }
      };

      const keyCheck = keyChecks[key];

      if (!keyCheck) throw new BadRequestError(`${key} is not a valid key of a run.`);
      
      const newValue = await keyCheck(request.body[key]);
      if (newValue !== undefined) {

        request.body[key] = newValue;

      } else {

        delete request.body[key];

      }

    }

    targetRun = await targetRun.edit(
      {
        $set: request.body,
        $unset: unsetProperties
      },
    );

    await addToAuditLog("games.runs.edit", actor._id, targetRun._id, response.locals.sessionID);

    response.status(200).json(await targetRun.getExtendedProperties());

  } catch (error: unknown) {

    if (error instanceof RunNotFoundError || error instanceof NoPermissionError || error instanceof InternalServerError || error instanceof BadRequestError) {
                            
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
