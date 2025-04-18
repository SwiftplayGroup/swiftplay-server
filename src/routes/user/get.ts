import { Router } from "express";
import authenticator from "#utils/authenticator.js";

const getAuthenticatedUserRouter = Router({ mergeParams: true });

getAuthenticatedUserRouter.get("/", authenticator);
getAuthenticatedUserRouter.get("/", async (request, response) => {
  response.json(response.locals.user);
});

export default getAuthenticatedUserRouter;
