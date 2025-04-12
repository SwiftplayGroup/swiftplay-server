import database from "#utils/database-generator.js";
import { Router } from "express";
import { hash as hashString } from "argon2";
import accountIDRouter from "./accounts/[accountID].js";
import accountLikesRouter from "./accounts/likes/[accountID].js";

const router = Router();
router.use("/:accountID", accountIDRouter);
router.use("/likes/:accountID", accountLikesRouter);

router.post("/", async (request, response) => {
  // Verify that a valid email address, username, and password were provided.
  const { emailAddress, username, password } = request.body;

  if (typeof emailAddress !== "string") {
    return response.status(400).json({
      message: "Email address must be a string.",
    });
  } else if (typeof username !== "string") {
    return response.status(400).json({
      message: "Username must be a string.",
    });
  } else if (typeof password !== "string") {
    return response.status(400).json({
      message: "Password must be a string.",
    });
  } else if (!emailAddress.trim() || !username.trim() || !password) {
    return response.status(400).json({
      message: `A${!emailAddress ? "n email address" : !username ? " username" : " password"} is required to create an account.`,
    });
  }

  // Ensure that there isn't another user with the same username.
  const accountsCollection = database.collection("accounts");
  const conflictCount = await accountsCollection.countDocuments({
    username: new RegExp(`^${username}$`, "i"),
  });

  if (conflictCount > 0) {
    return response.status(409).json({
      message: "That username is currently being used.",
    });
  }

  // Create an encrypted hash of the user's password.
  const hashedPassword = await hashString(password);

  // Try to save the user's account data into a new entry on the database.
  let accountID;
  try {
    const result = await accountsCollection.insertOne({
      emailAddress,
      username,
      password: hashedPassword,
    });
    accountID = result.insertedId;
  } catch (error: unknown) {
    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });
  }

  return response.status(201).json({ accountID });
});

export default router;
