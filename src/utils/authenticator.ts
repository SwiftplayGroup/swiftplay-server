import { NextFunction, Request, Response } from "express";
import database from "./database-generator.js";
import { verify } from "argon2";
import { ObjectId } from "mongodb";
import User from "#classes/User.js";

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
          const user = await User.getFromID(accountID);
          user.setSessionID(session._id);
          response.locals.user = user;

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
