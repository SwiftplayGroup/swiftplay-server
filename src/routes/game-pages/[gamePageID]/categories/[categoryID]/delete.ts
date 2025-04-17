import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";
import { AuthenticatedResponse } from "#classes/User.js";

const deleteCategoryRouter = Router({ mergeParams: true });

// Delete a run category.
deleteCategoryRouter.delete("/", authenticator);
deleteCategoryRouter.delete("/", async (request: Request<{ categoryID: string }>, response: AuthenticatedResponse) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { user } = response.locals;
  user.verifyPermission("gamePages.categories.delete", 1);

  let category;
  const runCategoriesCollection = database.collection("runCategories");

  try {
    
    const gamePageID = new ObjectId(request.params.categoryID);
    category = await runCategoriesCollection.findOne({
      _id: new ObjectId(gamePageID)
    });

    if (!category) {

      response.status(404).json({
        message: "Run category not found.",
      });
      return;

    }

  } catch (error: unknown) {

    if (error instanceof Error && error.name.slice(0, 9) === "BSONError") {

      response.status(404).json({
        message: "Run category not found.",
      });

    } else {

      console.log(error);

      response.status(500).json({
        message: "Something bad happened on our side. Try again later.",
      });

    }

    return;
    
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

    await addToAuditLog("gamePages.categories.delete", user._id, category._id, user.getSessionID());

    response.status(204).json({
      success: true
    });

  } catch (error: unknown) {

    console.warn(error);

    response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

  }

});

export default deleteCategoryRouter;
