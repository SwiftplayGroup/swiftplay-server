import { NextFunction, Request, Response } from "express";
import database from "./database-generator.js";
import { verify } from "argon2";
import { ObjectId } from "mongodb";
import User from "#classes/User.js";

async function authenticator(request: Request, response: Response, next: NextFunction) {

  try {

    const token = request.headers.token;
    const userIDString = request.headers["user-id"];

    if (typeof(token) == "string" && typeof(userIDString) == "string" && token.trim() && userIDString.trim()) {

      const userID = new ObjectId(userIDString);
      const sessions = await database.collection("sessions").find({userID}).toArray();

      for (const session of sessions) {

        if (await verify(session.tokenHash, token)) {

          // Save account data.
          const user = await User.getFromID(userID);
          user.setSessionID(session._id);
          response.locals.user = user;

          next();
          return;

        }

      }

    }

    response.status(401).json({
      message: "Provide valid authentication token and user ID headers."
    });

  } catch (error: unknown) {

    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our side. Try again later."
    });

  }

}

export default authenticator;
