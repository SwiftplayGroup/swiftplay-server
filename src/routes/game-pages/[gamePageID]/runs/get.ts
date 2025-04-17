import { Request, Router } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const getRunsRouter = Router({mergeParams: true});

getRunsRouter.get("/", async (request: Request<{ gamePageID: string }>, response) => {

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

export default getRunsRouter;