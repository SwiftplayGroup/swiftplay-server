import { NextFunction, Request, Response } from "express";
import database from "./database-generator.js";
import { ObjectId } from "mongodb";
import User from "#classes/User.js";
import jsonwebtoken from "jsonwebtoken";
import { readFileSync } from "fs";

async function authenticator(request: Request, response: Response, next: NextFunction) {

  try {

    const { authorization } = request.headers;
    const token = authorization?.match(/^Bearer (\S+)$/)?.[1];

    if (token) {

      const payload = jsonwebtoken.decode(token);
      if (payload && typeof(payload) === "object" && payload.sub && payload.jti) {

        const sessionID = payload.jti;
        const session = await database.collection("sessions").findOne({_id: new ObjectId(sessionID)});

        jsonwebtoken.verify(token, readFileSync(`${process.env.ENVIRONMENT === "production" ? "" : process.cwd()}/etc/secrets/public.pem`));

        if (session) {

          // Save account data.
          const userID = payload.sub;
          const user = await User.getFromID(userID);
          user.setSessionID(session._id);
          response.locals.user = user;

          next();
          return;

        }
        
      }

    }

    response.status(401).json({
      message: "Provide a valid authentication bearer token."
    });

  } catch (error: unknown) {

    if (error instanceof jsonwebtoken.JsonWebTokenError) {

      response.status(401).json({
        message: "Provide a valid authentication bearer token."
      });

    } else {

      console.error(error);

      response.status(500).json({
        message: "Something bad happened on our side. Try again later."
      });

    }

  }

}

export default authenticator;
