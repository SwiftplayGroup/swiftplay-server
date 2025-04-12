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

    const accountData: { [key: string]: unknown } = {};

    for (const key of Object.keys(accountDocument)) {
      accountData[key === "_id" ? "accountID" : key] = accountDocument[key];
    }

    response.json(accountData);
  } catch (error: unknown) {
    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });
  }
});

export default router;
