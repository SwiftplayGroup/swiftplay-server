import { Router } from "express";
import authenticator from "#utils/authenticator.js";

const getAuthenticatedUserRouter = Router({ mergeParams: true });

getAuthenticatedUserRouter.get("/", authenticator);
getAuthenticatedUserRouter.get("/", async (request, response) => {
  const account: { [key: string]: unknown } = {};

  for (const key of Object.keys(response.locals.user)) {
    account[key === "_id" ? "accountID" : key] = response.locals.user[key];
  }

  response.json(account);
});

export default getAuthenticatedUserRouter;
