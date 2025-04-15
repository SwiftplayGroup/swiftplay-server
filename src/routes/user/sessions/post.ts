import database from "#utils/database-generator.js";
import { Router } from "express";
import { hash as hashString, verify as verifyPassword } from "argon2";
import { randomBytes } from "crypto";

const createSessionRouter = Router({ mergeParams: true });

createSessionRouter.post("/", async (request, response) => {
  // Verify that the user provides a valid username and password.
  const { username, password } = request.body;
  if (typeof username !== "string") {
    return response.status(400).json({
      message: "Username must be a string.",
    });
  } else if (typeof password !== "string") {
    return response.status(400).json({
      message: "Password must be a string.",
    });
  } else if (!username.trim() || !password) {
    return response.status(400).json({
      message: `A ${username ? "password" : "username"} is required.`,
    });
  }

  const usersCollection = database.collection("users");
  const userFilter = {
    username: new RegExp(`^${username}$`, "i"),
  };
  const userData = await usersCollection.findOne(userFilter);

  if (!(userData && (await verifyPassword(userData.password, password)))) {
    return response.status(401).json({
      message: "Incorrect username or password.",
    });
  }

  // Create a random hashed token and save it to the user's profile in the database.
  const sessionToken = randomBytes(64).toString("hex");
  const creationDate = new Date();
  const expirationDate = new Date(creationDate);
  expirationDate.setDate(creationDate.getDate() + 30);
  const sessionData = {
    creationDate,
    creationIP: request.socket.remoteAddress,
    expirationDate,
    accountID: userData._id,
  };

  let sessionID;

  try {
    const { insertedId } = await database
      .collection("sessions")
      .insertOne({ ...sessionData, tokenHash: await hashString(sessionToken) });

    sessionID = insertedId;
  } catch (error: unknown) {
    console.error(error);

    return response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });
  }

  // Return a 201 success, and a JSON response body with the session data.
  return response
    .status(201)
    .json({ ...sessionData, token: sessionToken, sessionID });
});

export default createSessionRouter;
