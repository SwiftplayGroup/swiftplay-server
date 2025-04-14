import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import database from "./database-generator.js";

async function getAuthenticatedMember(request: Request<{groupID: string}>, response: Response, next: NextFunction) {

  try {

    // Verify that the user is authenticated.
    if (!response.locals.user) {

      return response.status(401).json({
        message: ""
      });

    }

    // Verify that the user is a part of the group.
    const groupID = new ObjectId(request.params.groupID);
    const groupMember = await database.collection("groupMembers").findOne({groupID});
    if (!groupMember) {

      return response.status(403).json({
        message: "You are not a part of this group."
      });

    }

    // Save the member object.
    response.locals.groupMember = groupMember;
    next();

  } catch (error: unknown) {

    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later."
    });

  }

}

export default getAuthenticatedMember;
