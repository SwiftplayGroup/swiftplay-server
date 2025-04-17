import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import { ObjectId } from "mongodb";

const getUserRouter = Router({ mergeParams: true });

getUserRouter.get("/", async (request: Request<{ userID: string }>, response) => {
  let accountID;

  try {
    accountID = new ObjectId(request.params.userID);
  } catch (error: unknown) {
    return response.status(404).json({
      message: `Account not found, ${error}`,
    });
  }

  try {
    const user = await database
      .collection("users")
      .findOne({ _id: accountID });
    if (!user) {
      return response.status(404).json({
        message: "Account not found.",
      });
    }

    const account: { [key: string]: unknown } = {};

    for (const key of Object.keys(user)) {
      account[key === "_id" ? "accountID" : key] = user[key];
    }

    response.json(account);
  } catch (error: unknown) {
    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });
  }
});

export default getUserRouter;
