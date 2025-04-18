import { Router } from "express";
import Game from "#classes/Game.js";

const getGamePagesRouter = Router({mergeParams: true});

getGamePagesRouter.get("/", async (request, response) => {

  try {

    const requestedGameNames: {name: RegExp}[] = [];

    if (typeof(request.query.name) === "string") {

      requestedGameNames.push({name: new RegExp(`${request.query.name}`, "i")});

    } else if (request.query.name instanceof Array) {

      for (const username of request.query.name) {

        requestedGameNames.push({name: new RegExp(`^${username}$`, "i")});
        
      }

    }

    const games = await Game.find(requestedGameNames.length > 0 ? requestedGameNames : {});

    response.json(games);

  } catch (error: unknown) {

    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });

  }

});

export default getGamePagesRouter;
