import { Router, Request } from "express";
import authenticator from "#utils/authenticator.js";
import User from "#classes/User.js";
import Run from "#classes/Run.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { RunNotFoundError } from "#classes/errors/RunNotFoundError.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";

const editRunRouter = Router({ mergeParams: true });

editRunRouter.patch("/", authenticator);
editRunRouter.patch("/", async (request: Request<{ runID: string }>, response) => {

  try {

    const actor: User = response.locals.user;
    let targetRun = await Run.getFromID(request.params.runID);

    // Verify properties.
    const unsetProperties: {[key: string]: 1} = {};
    for (const key of Object.keys(request.body)) {

      const youtubeRegex = /^[^"&?\/\s]{11}$/gi;
      const keyChecks: {[key: string]: (value: unknown) => unknown} = {
        verification: (value: unknown) => {

          // Make sure the user can do this.


          if (value === null) {

            delete request.body.verification;
            unsetProperties.verification = 1;

          } else if (typeof(value) === "object" && !(value instanceof Array)) {

            for (const key of Object.keys(value)) {

              const validations = {
                ownerID: (value: unknown) => typeof(value) === "string",
                // TODO: Turn verifications into 
              }

            }

          }

          throw new BadRequestError("Verification must be null or an object.");

        },
        durationMilliseconds: (value: unknown) => typeof (value) === "number",
        youtubeWatchID: (value: unknown) => typeof (value) === "string" && youtubeRegex.test(value)
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

    response.status(200).json(targetRun);

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
