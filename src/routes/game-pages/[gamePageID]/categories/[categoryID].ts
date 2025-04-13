import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator, { defaultPermissions } from "#utils/authenticator.js";
import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";

const router = Router({ mergeParams: true });

// Delete a run category.
router.delete("/", authenticator);
router.delete("/", async (request: Request<{ categoryID: string }>, response) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { permissionOverwrites, _id: actorID } = response.locals.accountData;
  if (permissionOverwrites?.gamePages?.categories?.delete === false || (!defaultPermissions.gamePages.categories.delete && !permissionOverwrites?.gamePages?.categories?.delete)) {

    return response.status(403).json({
      message: "You don't have permission to do that."
    });

  }

  let category;
  const runCategoriesCollection = database.collection("runCategories");

  try {
    
    const gamePageID = new ObjectId(request.params.categoryID);
    category = await runCategoriesCollection.findOne({
      _id: new ObjectId(gamePageID)
    });

    if (!category) {

      return response.status(404).json({
        message: "Run category not found.",
      });

    }

  } catch (error: unknown) {

    if (error instanceof Error && error.name.slice(0, 9) === "BSONError") {

      return response.status(404).json({
        message: "Run category not found.",
      });

    } else {

      console.log(error);

      return response.status(500).json({
        message: "Something bad happened on our side. Try again later.",
      });

    }
    
  }

  try {

    // Move all runs to the default category.
    await database.collection("runs").updateMany({
      categoryID: category._id
    }, {
      $unset: {
        categoryID: 1
      }
    });
    
    console.log(`Moved all runs associated with ${category._id} to the default category`);

    // Delete the run category from the records.
    await runCategoriesCollection.deleteOne({
      _id: category._id
    });

    console.log(`Successfully deleted a run category: ${category._id}`);

    await addToAuditLog("gamePages.categories.delete", actorID, category._id, response.locals.sessionID);

    return response.status(204).json({
      success: true
    });

  } catch (error: unknown) {

    console.warn(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

  }

});

export default router;
