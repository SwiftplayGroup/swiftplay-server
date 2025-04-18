/**
 * Get all users.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Request, Router } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import User from "#classes/User.js";

const getUsersRouter = Router({
  mergeParams: true,
});

getUsersRouter.get("/", async (req: Request<unknown, unknown, unknown, {username?: (string | string[])}>, res) => {

  try {

    const requestedUsernames: {username: RegExp}[] = [];

    if (typeof(req.query.username) === "string") {

      requestedUsernames.push({username: new RegExp(`^${req.query.username}$`, "i")});

    } else if (req.query.username instanceof Array) {

      for (const username of req.query.username) {

        requestedUsernames.push({username: new RegExp(`^${username}$`, "i")});
        
      }

    }

    const users = await User.find(requestedUsernames.length > 0 ? {
      $or: requestedUsernames
    } : undefined);

    res.json(users);

  } catch (error) {
  
    if (error instanceof InternalServerError) {
    
      res.status(error.statusCode).json({
        message: error.message
      });

    } else {

      console.warn(error);

      const internalServerError = new InternalServerError();
      res.status(internalServerError.statusCode).json({
        message: internalServerError.message
      });

    }
  
  }

});

export default getUsersRouter;
