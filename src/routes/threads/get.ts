/**
 * Get all threads.
 * 
 * Programmers: Christian Toney (https://github.com/Christian-Toney) and Michael Strange (https://github.com/michael-strange)
 * © 2025 Swiftplay Group
 */

import { Router } from "express";
import { InternalServerError } from "#classes/errors/InternalServerError.js";
import Thread from "#classes/Thread.js";

const getThreadsRouter = Router({
  mergeParams: true,
});

getThreadsRouter.get("/", async (req, res) => {

  try {

    const threads = await Thread.find();
    res.json(threads);

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

export default getThreadsRouter;
