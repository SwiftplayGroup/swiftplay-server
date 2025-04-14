import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";

const router = Router({ mergeParams: true });

router.get("/", async (request: Request<{ accountID: string }>, response) => {
  let accountID;

  try {
    accountID = new ObjectId(request.params.accountID);
  } catch (error: unknown) {
    return response.status(404).json({
      message: `Account not found, ${error}`,
    });
  }

  try {
    const accountDocument = await database
      .collection("accounts")
      .findOne({ _id: accountID });
    if (!accountDocument) {
      return response.status(404).json({
        message: "Account not found.",
      });
    }

    const account: { [key: string]: unknown } = {};

    for (const key of Object.keys(accountDocument)) {
      account[key === "_id" ? "accountID" : key] = accountDocument[key];
    }

    response.json(account);
  } catch (error: unknown) {
    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });
  }
});

router.patch("/", authenticator);
router.patch("/", async (request: Request<{ accountID: string }>, response) => {

  const { _id: actorID } = response.locals.account;

  // Verify properties.
  const unsetPermissions: Record<string, any> = {};
  for (const key of Object.keys(request.body)) {

    const keyChecks: {[key: string]: (value: unknown) => boolean | string} = {
      permissionOverrides: (value: unknown) => {

        // Verify input.
        if (!value || typeof(value) !== "object") {

          return "Permission overrides must be an object."

        }

        const groups = [value];
        const nameGroups = [];
        const indexedGroup: {[key: string]: any} = {};
        let closestGroup = indexedGroup;
        while (groups.length > 0) {
          
          let shouldGoUp = true;
          let currentGroup: {[key: string]: any} = groups[groups.length - 1];

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
              let permissionGroup = response.locals.account.permissionOverrides;
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

                return `${nameGroups.join(".")}.${permissionName} must be 0, 1, or 2.`

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

              newClosestIndexedGroup = newClosestIndexedGroup[name]

            }

            closestGroup = newClosestIndexedGroup;

          }

        }

        return true;

      }
    };

    const keyCheck = keyChecks[key];
    if (!keyCheck) {

      return response.status(400).json({
        message: `${key} is an invalid property.`
      });

    }
    
    const responseMessage = keyCheck(request.body[key]);
    if (typeof(responseMessage) !== "boolean") {

      return response.status(400).json({
        message: responseMessage
      });

    }

  }

  // Make sure the account exists.
  let account;
  let accountsCollection = database.collection("accounts");

  try {
    
    const gamePageID = new ObjectId(request.params.accountID);
    account = await accountsCollection.findOne({
      _id: new ObjectId(gamePageID)
    });

    if (!account) {

      return response.status(404).json({
        message: "Account not found.",
      });

    }

  } catch (error: unknown) {

    if (error instanceof Error && error.name.slice(0, 9) === "BSONError") {

      return response.status(404).json({
        message: "Account not found.",
      });

    } else {

      console.log(error);

      return response.status(500).json({
        message: "Something bad happened on our side. Try again later.",
      });

    }
    
  }

  try {

    await accountsCollection.updateOne(
      {_id: account._id},
      {
        $set: request.body,
        $unset: unsetPermissions
      },
    );

    await addToAuditLog("accounts.edit", actorID, account._id, response.locals.sessionID)

  } catch (error: unknown) {

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

  }

  // Update properties.


  return response.status(200).json({
    success: true
  });

});

export default router;
