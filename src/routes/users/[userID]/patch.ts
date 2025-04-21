import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import { UserNotFoundError } from "#classes/errors/UserNotFoundError.js";
import Permission, { PermissionAccessLevel } from "#classes/Permission.js";
import Run from "#classes/Run.js";
import User from "#classes/User.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import { Request, Router } from "express";

const editUserRouter = Router({ mergeParams: true });

editUserRouter.patch("/", authenticator);
editUserRouter.patch("/", async (request: Request<{ userID: string }>, response) => {

  try {

    const actor: User = response.locals.user;
    let targetUser = await User.getFromID(request.params.userID);

    // Verify properties.
    const unsetPermissions: {[permissionID: string]: 1} = {};
    for (const key of Object.keys(request.body)) {

      const keyChecks: {[key: string]: (value: unknown) => unknown} = {
        permissionOverrides: async (value: unknown) => {

          // Verify input.
          if (!value || typeof(value) !== "object") {

            throw new BadRequestError("Permission overrides must be an object.");

          }

          const permissionCache: {[key: string]: Permission | undefined} = {};

          for (const permissionID of Object.keys(value)) {

            const permission = permissionCache[permissionID] ?? await Permission.getFromID(permissionID);
            permissionCache[permissionID] = permission;
            const currentOverrideAccessLevel = actor.permissionOverrides?.[permission._id.toHexString()];
            const highestAccessLevel = currentOverrideAccessLevel && currentOverrideAccessLevel > permission.defaultAccessLevel ? currentOverrideAccessLevel : permission.defaultAccessLevel;

            if (highestAccessLevel < PermissionAccessLevel.ADMIN) {

              throw new NoPermissionError();

            }

            if (value[permissionID as keyof typeof value] === null) {

              delete request.body.permissionOverrides[permissionID];
              unsetPermissions[`permissionOverrides.${permission._id}`] = 1;
              
            } else {
              
              const newAccessLevel = request.body.permissionOverrides[permissionID];
              if (typeof(newAccessLevel) !== "number") {

                throw new BadRequestError(`permissionOverrides.${permission._id} must be a number or null.`);

              } else {

                request.body[`permissionOverrides.${permission._id}`] = newAccessLevel;

              }

            }

          }

        },
        favoriteRunID: async (value: unknown) => {

          if (value === null) {

            return value;

          }

          if (typeof(value) !== "string") {

            throw new BadRequestError("favoriteRunID must be a valid run.");

          }

          const run = await Run.getFromID(value);
          return run._id;

        }
      };

      const keyCheck = keyChecks[key];
      
      const newValue = await keyCheck(request.body[key]);
      if (newValue !== undefined) {

        request.body[key] = newValue;

      } else {

        delete request.body[key];

      }

    }

    targetUser = await targetUser.edit(
      {
        $set: request.body,
        $unset: unsetPermissions
      },
    );

    await addToAuditLog("accounts.edit", actor._id, targetUser._id, response.locals.sessionID);

    response.status(200).json(targetUser);

  } catch (error: unknown) {

    if (error instanceof UserNotFoundError || error instanceof NoPermissionError || error instanceof InternalServerError || error instanceof BadRequestError) {
                            
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

export default editUserRouter;
