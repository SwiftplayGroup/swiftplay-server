/**
 * Lists members from a group. 
 * 
 * Programmer: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Request, Router } from "express";
import { NoPermissionError } from "#classes/errors/NoPermissionError.js";
import Group from "#classes/Group.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";
import { NotFoundError } from "#classes/errors/NotFoundError.js";

const getMembersRouter = Router({mergeParams: true});

getMembersRouter.get("/", async (request: Request<{groupID: string}>, response) => {

  try {

    // Verify group exists.
    const group = await Group.getFromID(request.params.groupID);

    // Return the info to the client.
    return response.json(await group.getMembers());

  } catch (error: unknown) {

    if (error instanceof BadRequestError || error instanceof NotFoundError || error instanceof NoPermissionError) {

      return response.status(error.statusCode).json({
        message: error.message
      });

    } else {
      
      console.error(error);

      return response.status(500).json({
        message: "Something bad happened on our end. Try again later."
      });

    }
    
  }

});

export default getMembersRouter;
