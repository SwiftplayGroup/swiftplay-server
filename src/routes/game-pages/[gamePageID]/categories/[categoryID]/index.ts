import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator, { defaultPermissions } from "#utils/authenticator.js";
import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";

const router = Router({ mergeParams: true });

// Edit a run category.
router.patch("/", authenticator);
router.patch("/", async (request: Request<{ categoryID: string }>, response) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { permissionOverrides, _id: actorID } = response.locals.account;
  if (permissionOverrides?.gamePages?.categories?.edit === 0 || (!defaultPermissions.gamePages.categories.edit && !permissionOverrides?.gamePages?.categories?.edit)) {

    return response.status(403).json({
      message: "You don't have permission to do that."
    });

  }

  // Verify properties.
  for (const key of Object.keys(request.body)) {

    const keyChecks: {[key: string]: (value: unknown) => boolean | string} = {
      name: (value: unknown) => (
        typeof(value) !== "string" ? "Name must be a string." : (
          value.length > 64 || value.length < 1 ? "Name must be between 1 to 64 characters." : true
        )
      ),
      description: (value: unknown) => (
        value === undefined ? true : (
          typeof(value) !== "string" ? "Description must be a string." : (
            value.length > 1024 || value.length < 0 ? "Description must be between 0 to 1024 characters." : true
          )
        )
      )
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

  let category;
  const categoriesCollection = database.collection("runCategories");

  try {
    
    const categoryID = new ObjectId(request.params.categoryID);
    category = await categoriesCollection.findOne({
      _id: new ObjectId(categoryID)
    });

    if (!category) {

      return response.status(404).json({
        message: "Category not found.",
      });

    }

  } catch (error: unknown) {

    if (error instanceof Error && error.name.slice(0, 9) === "BSONError") {

      return response.status(404).json({
        message: "Category not found.",
      });

    } else {

      console.log(error);

      return response.status(500).json({
        message: "Something bad happened on our side. Try again later.",
      });

    }
    
  }

  try {

    await categoriesCollection.updateOne(
      {_id: category._id},
      {
        $set: request.body
      }
    );

    await addToAuditLog("gamePages.categories.edit", actorID, category._id, response.locals.sessionID);

  } catch (error: unknown) {

    console.warn(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

  }

  return response.status(200).json({
    success: true
  });

});

// Delete a run category.
router.delete("/", authenticator);
router.delete("/", async (request: Request<{ categoryID: string }>, response) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { permissionOverrides, _id: actorID } = response.locals.account;
  if (permissionOverrides?.gamePages?.categories?.delete === 0 || (!defaultPermissions.gamePages.categories.delete && !permissionOverrides?.gamePages?.categories?.delete)) {

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
