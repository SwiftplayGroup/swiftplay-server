/**
 * Get all categories from a specific game.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney)
 * © 2025 Swiftplay Group
 */

import { Request, Router } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Game from "#classes/Game.js";
import { GameNotFoundError } from "#classes/errors/GameNotFoundError.js";

const getCategoriesRouter = Router({
  mergeParams: true,
});

getCategoriesRouter.get("/", async (request: Request<{gameID: string}, unknown, unknown, {username?: (string | string[])}>, res) => {

  try {

    const game = await Game.getFromID(request.params.gameID);
    const categories = await game.getCategories();

    res.json(categories);

  } catch (error) {
  
    if (error instanceof GameNotFoundError || error instanceof InternalServerError) {
    
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

export default getCategoriesRouter;
