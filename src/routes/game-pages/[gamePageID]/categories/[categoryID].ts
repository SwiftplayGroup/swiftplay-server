import authenticator, { defaultPermissions } from "#utils/authenticator.js";
import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";

const router = Router({ mergeParams: true });

// Create a run category.
router.delete("/", authenticator);
router.delete("/", async (request: Request<{ gamePageID: string, categoryID: string }>, response) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { permissionOverwrites, _id: actorID } = response.locals.accountData;
  if (permissionOverwrites?.gamePages?.categories?.delete === false || (!defaultPermissions.gamePages.categories.delete && !permissionOverwrites?.gamePages?.categories?.delete)) {

    return response.status(403).json({
      message: "You don't have permission to do that."
    });

  }

  console.log(`Successfully created run category: `);

  return response.status(204).json({
    success: true
  })

});

export default router;
