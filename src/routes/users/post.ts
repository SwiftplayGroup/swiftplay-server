import database from "#utils/database-generator.js";
import { Router } from "express";
import { hash as hashString } from "argon2";
import User from "#classes/User.js";

const createUserRouter = Router({ mergeParams: true });

createUserRouter.post("/", async (request, response) => {
  // Verify that a valid email address, username, and password were provided.
  const { emailAddress, username, password } = request.body;

  if (typeof emailAddress !== "string") {
    response.status(400).json({
      message: "Email address must be a string.",
    });

    return;
  } else if (typeof username !== "string" || username.length < 1 || username.length > 32) {
    response.status(400).json({
      message: "Username must be a string that ranges from 1 to 32 characters.",
    });

    return;
  } else if (typeof password !== "string" || password.length < 8 || username.length > 128) {
    response.status(400).json({
      message: "Password must be a string that ranges from 8 to 128 characters.",
    });

    return;
  } else if (!emailAddress.trim() || !username.trim() || !password) {
    response.status(400).json({
      message: `A${!emailAddress ? "n email address" : !username ? " username" : " password"} is required to create an account.`,
    });

    return;
  }

  // Ensure that there isn't another user with the same username.
  const usersCollection = database.collection("users");
  const conflictCount = await usersCollection.countDocuments({
    username: new RegExp(`^${username}$`, "i"),
  });

  if (conflictCount > 0) {
    response.status(409).json({
      message: "That username is currently being used.",
    });

    return;
  }

  // Create an encrypted hash of the user's password.
  const hashedPassword = await hashString(password);

  // Try to save the user's account data into a new entry on the database.
  let accountID;
  try {
    const result = await usersCollection.insertOne({
      emailAddress,
      username,
      password: hashedPassword,
      embeddings: null, //when a user likes a post, the first embed will be made.
    });
    accountID = result.insertedId;
    
    const user = await User.getFromID(accountID);

    response.status(201).json(user);
  } catch (error: unknown) {
    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });
  }

});

export default createUserRouter;
