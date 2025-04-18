/**
 * Get all permissions.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney) and Michael Strange (https://github.com/michael-strange)
 * © 2025 Swiftplay Group
 */

import { Router } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Permission from "#classes/Permission.js";

const getPermissionsRouter = Router({
  mergeParams: true,
});

getPermissionsRouter.get("/", async (req, res) => {

  try {

    const permissions = await Permission.find();
    res.json(permissions);

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

export default getPermissionsRouter;
