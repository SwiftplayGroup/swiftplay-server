import { BadRequestError } from "#classes/errors/BadRequestError.js";
import Run from "#classes/Run.js";
import User from "#classes/User.js";
import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import { Request, Router } from "express";

const editUserRouter = Router({ mergeParams: true });

editUserRouter.patch("/", authenticator);
editUserRouter.patch("/", async (request: Request<{ userID: string }>, response) => {

  const { _id: actorID } = response.locals.user;

  const user = await User.getFromID(request.params.userID);

  // Verify properties.
  const unsetPermissions: Record<string, any> = {};
  for (const key of Object.keys(request.body)) {

    const keyChecks: {[key: string]: (value: unknown) => unknown} = {
      permissionOverrides: (value: unknown) => {

        // Verify input.
        if (!value || typeof(value) !== "object") {

          throw new BadRequestError("Permission overrides must be an object.");

        }

        const groups = [value];
        const nameGroups = [];
        const indexedGroup: {[key: string]: any} = {};
        let closestGroup = indexedGroup;
        while (groups.length > 0) {
          
          let shouldGoUp = true;
          const currentGroup: {[key: string]: any} = groups[groups.length - 1];

          for (const permissionName of Object.keys(currentGroup)) {

            const permissionValue = currentGroup[permissionName];
            if (closestGroup[permissionName]) {

              continue;

            } else if (permissionValue instanceof Object && !(permissionValue instanceof Array)) {

              closestGroup[permissionName] = {};
              closestGroup = closestGroup[permissionName];
              groups.push(permissionValue);
              nameGroups.push(permissionName);
              shouldGoUp = false;

              break;

            } else if (typeof(permissionValue) === "number") {

              // Verify that the person has permission to change a specific permission.
              let permissionGroup = response.locals.user.permissionOverrides;
              for (const name of nameGroups) {

                permissionGroup = permissionGroup[name];
                if (!permissionGroup) {

                  break;

                }

              }

              const ownPermissionLevel = permissionGroup?.[permissionName] ?? 0;
              if (ownPermissionLevel < 2) {

                return `You don't have permission to change the ${nameGroups.join(".")}.${permissionName} permission.`;

              }

              if (permissionValue < 0 || permissionValue > 2) {

                return `${nameGroups.join(".")}.${permissionName} must be 0, 1, or 2.`;

              }

            } else if (permissionValue === null) { 
              
              delete currentGroup[permissionName];

              let permissionGroup = unsetPermissions;
              for (const name of nameGroups) {

                permissionGroup[name] = permissionGroup[name] ?? {};
                permissionGroup = permissionGroup[name];

              }

              permissionGroup[permissionName] = 1;

            } else {
 
              return `${nameGroups.join(".")}.${permissionName} must be an object, a number, or null.`;

            }

          }

          if (shouldGoUp) {

            groups.pop();
            nameGroups.pop();

            let newClosestIndexedGroup = indexedGroup;
            for (const name of nameGroups) {

              newClosestIndexedGroup = newClosestIndexedGroup[name];

            }

            closestGroup = newClosestIndexedGroup;

          }

        }

        return value;

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
    
    request.body[key] = await keyCheck(request.body[key]);

  }

  try {

    await user.edit(
      {
        $set: request.body,
        $unset: unsetPermissions
      },
    );

    await addToAuditLog("accounts.edit", actorID, user._id, response.locals.sessionID);

    response.status(200).json({
      success: true
    });

  } catch (error: unknown) {

    console.warn(error);

    response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

    return;

  }

});

export default editUserRouter;
