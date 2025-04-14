import { NextFunction, Request, Response } from "express";
import database from "./database-generator.js";
import { verify } from "argon2";
import { ObjectId } from "mongodb";

export const defaultPermissions = {
  gamePages: {
    categories: {
      create: 0,
      delete: 0,
      edit: 0
    },
    create: 1,
    delete: 0,
    edit: 0
  }
}

export type Account = {
  _id: ObjectId,
  permissionOverrides: {
    gamePages: {
      create?: boolean;
    }
  }
}

async function authenticator(request: Request, response: Response, next: NextFunction) {

  try {

    const token = request.headers.token;
    const accountIDString = request.headers["account-id"];

    if (typeof(token) == "string" && typeof(accountIDString) == "string") {

      const accountID = new ObjectId(accountIDString);
      const sessions = await database.collection("sessions").find({accountID}).toArray();

      for (const session of sessions) {

        if (await verify(session.tokenHash, token)) {

          // Save account data.
          const account = await database.collection("accounts").findOne({_id: accountID});
          response.locals.sessionID = session._id;
          response.locals.account = account;

          next();
          return;

        }

      }

    }

    return response.status(401).json({
      message: "Provide valid authentication token and account ID headers."
    });

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later."
    });

  }

}

export default authenticator;