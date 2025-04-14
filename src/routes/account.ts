import { Router } from "express";
import sessionsRouter from "./account/sessions.js";
import authenticator from "#utils/authenticator.js";

const router = Router();
router.use("/sessions", sessionsRouter);

router.get("/", authenticator);
router.get("/", async (request, response) => {

  const account: {[key: string]: unknown} = {};

  for (const key of Object.keys(response.locals.account)) {

    account[key === "_id" ? "accountID" : key] = response.locals.account[key];

  }

  response.json(account);

});

export default router;