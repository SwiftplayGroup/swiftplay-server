import addToAuditLog from "#utils/addToAuditLog.js";
import authenticator from "#utils/authenticator.js";
import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";
import { AuthenticatedResponse } from "#classes/User.js";

const editCategoryRouter = Router({ mergeParams: true });

editCategoryRouter.patch("/", authenticator);
editCategoryRouter.patch("/", async (request: Request<{ categoryID: string }>, response: AuthenticatedResponse) => {

  // Verify permissions.
  // TODO: Check game page permissions.
  const { user } = response.locals;
  user.verifyPermission("gamePages.categories.edit", 1);

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

    await addToAuditLog("gamePages.categories.edit", user._id, category._id, user.getSessionID());

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

export default editCategoryRouter;
