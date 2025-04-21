import database from "#utils/database-generator.js";
import { Router } from "express";
import { hash as hashString, verify as verifyPassword } from "argon2";
import { randomBytes } from "crypto";

const createSessionRouter = Router({ mergeParams: true });

createSessionRouter.post("/", async (request, response) => {
  // Verify that the user provides a valid username and password.
  const { username, password } = request.body;
  if (typeof username !== "string") {
    response.status(400).json({
      message: "Username must be a string.",
    });
    return;
  } else if (typeof password !== "string") {
    response.status(400).json({
      message: "Password must be a string.",
    });
    return;
  } else if (!username.trim() || !password) {
    response.status(400).json({
      message: `A ${username ? "password" : "username"} is required.`,
    });
    return;
  }

  const usersCollection = database.collection("users");
  const userFilter = {
    username: new RegExp(`^${username}$`, "i"),
  };
  const userData = await usersCollection.findOne(userFilter);

  if (!(userData && (await verifyPassword(userData.password, password)))) {
    response.status(401).json({
      message: "Incorrect username or password.",
    });

    return;
  }

  // Create a random hashed token and save it to the user's profile in the database.
  const sessionToken = randomBytes(64).toString("hex");
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 14);
  const sessionData = {
    creationIP: request.socket.remoteAddress,
    expirationDate,
    userID: userData._id,
  };

  let sessionID;

  try {
    const { insertedId } = await database
      .collection("sessions")
      .insertOne({ ...sessionData, tokenHash: await hashString(sessionToken) });

    sessionID = insertedId;
  } catch (error: unknown) {
    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

    return;
  }

  // Return a 201 success, and a JSON response body with the session data.
  response.status(201).json({ ...sessionData, sessionID, token: sessionToken });
});

export default createSessionRouter;
