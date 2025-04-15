import { Request, Router } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";
import authenticator from "#utils/authenticator.js";
import { AuthenticatedResponse } from "#classes/User.js";

const createRunRouter = Router({mergeParams: true});

createRunRouter.post("/", authenticator);
createRunRouter.post("/", async (request: Request<{ gamePageID: string }>, response: AuthenticatedResponse) => {

  const { user } = response.locals;
  user.verifyPermission("gamePages.runs.create", 1);

  const { gamePageID } = request.params;
  const { time, url } = request.body;

  let objectID;
  try {

    objectID = new ObjectId(gamePageID);

  } catch (error) {

    console.warn(error);

    return response.status(404).json({ message: "Game page not found." });

  }

  // Convert time to an integer and validate
  const timeInt = parseInt(time, 10);
  if (isNaN(timeInt) || timeInt <= 0) {
    return response.status(400).json({ message: "Time must be an integer, representing milliseconds." });
  }

  // Verify that the user provides a valid YouTube video URL
  const youtubeRegex = /^(https?:\/\/)?((www\.)?youtube\.com\/watch\?v=|youtu\.?be\/).+$/;
  if (!url || typeof url !== "string" || !youtubeRegex.test(url)) {
    return response.status(400).json({ message: "Invalid YouTube video URL." });
  }

  // Log the received body
  try {

    const result = await database.collection("runs").insertOne({ 
      gamePageID: objectID, 
      time: timeInt, 
      url, 
      creatorID: response.locals.user._id 
    });
    // Return a 201 status code on success, along with the run ID
    return response.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error(error);
    // Return a 500 error if the database operation fails
    return response.status(500).json({ message: "Internal server error." });
  }
});

export default createRunRouter;