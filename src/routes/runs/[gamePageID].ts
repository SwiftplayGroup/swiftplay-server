import { Request, Response, Router } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";
import runIDRouter from "./[gamePageID]/[runID].js";
import authenticator from "#utils/authenticator.js";

const router = Router({mergeParams: true});
router.use("/:runID", runIDRouter);

router.get("/", async (request: Request<{ gamePageID: string }>, response) => {

  // Verify that the user provides a valid game page ID.
  let gamePageID;

  try {

    gamePageID = new ObjectId(request.params.gamePageID);

    // Verify the game page exists.
    const gamePageCount = await database.collection("gamePages").countDocuments({
      _id: gamePageID
    });
    
    if (gamePageCount == 0) {

      throw new Error();

    }

  } catch (error: unknown) {

    console.error(error);

    return response.status(404).json({
      message: "Game page not found."
    });

  }

  const runs = [];
  try {

    // Return the list of runs.
    const runDocuments = await database.collection("runs").find({
      $and: [
        {
          gamePageID
        },
        {
          ...(request.query.include_unverified === "true" ? {} : {
            verificationID: request.query.unverified_only === "true" ? null : {
              $ne: null
            }
          })
        },
        {
          ...(request.query.include_removed === "true" ? {} : {
            removalID: request.query.removed_only === "true" ? {
              $ne: null
            } : null
          })
        }
      ]
    }).toArray();
    for (const document of runDocuments) {

      const run: {[key: string]: unknown} = {...document};
      run.id = run._id;
      delete run._id;
      runs.push(run);

    }

  } catch (error: unknown) {

    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our side. Try again later."
    });

  }

  return response.json(runs);

});

router.post("/", authenticator);
router.post("/", async (request: Request<{ gamePageID: string }>, response: Response) => {

  const { gamePageID } = request.params;
  const { time, url } = request.body;

  let objectID;
  try {

    objectID = new ObjectId(gamePageID);

  } catch (error) {

    return response.status(404).json({ message: "Game page not found." });

  }

  // Convert time to an integer and validate
  const timeInt = parseInt(time, 10);
  if (isNaN(timeInt) || timeInt <= 0) {
    return response.status(400).json({ message: "Time must be an integer, representing milliseconds." });
  }

  // Verify that the user provides a valid YouTube video URL
  const youtubeRegex = /^(https?\:\/\/)?((www\.)?youtube\.com\/watch\?v=|youtu\.?be\/).+$/;
  if (!url || typeof url !== "string" || !youtubeRegex.test(url)) {
    return response.status(400).json({ message: "Invalid YouTube video URL." });
  }

  // Log the received body
  

  try {

    const createdAt = new Date();
    const result = await database.collection("runs").insertOne({ 
      gamePageID: objectID, 
      time: timeInt, 
      url, 
      creatorID: response.locals.account._id 
    });
    // Return a 201 status code on success, along with the run ID
    return response.status(201).json({ id: result.insertedId });
  } catch (error) {
    console.error(error);
    // Return a 500 error if the database operation fails
    return response.status(500).json({ message: "Internal server error." });
  }
});

export default router;