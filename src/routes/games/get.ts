import { Router } from "express";
import Game from "#classes/Game.js";

const getgamesRouter = Router({mergeParams: true});

getgamesRouter.get("/", async (request, response) => {

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
    const extendedGames = [];
    for (const game of games) {

      extendedGames.push(await game.getExtendedProperties());

    }

    response.json(extendedGames);

  } catch (error: unknown) {

    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our end. Try again later."
    });

  }

});

export default getgamesRouter;
