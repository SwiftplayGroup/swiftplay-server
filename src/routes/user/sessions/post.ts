import database from "#utils/database-generator.js";
import { Router } from "express";
import { verify as verifyPassword } from "argon2";
import jsonwebtoken from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { readFileSync } from "fs";

const createSessionRouter = Router({ mergeParams: true });

createSessionRouter.post("/", async (request, response) => {

  // Hash the token on the database so no one can see what it is.
  try {

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
    const sessionID = new ObjectId();
    const sessionToken = jsonwebtoken.sign({}, readFileSync(`${process.env.ENVIRONMENT === "production" ? "" : process.cwd()}/etc/secrets/private.pem`), {
      algorithm: "RS256",
      expiresIn: "14d",
      subject: userData._id.toHexString(),
      jwtid: sessionID.toHexString()
    });

    // Create a random hashed token and save it to the user's profile in the database.
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 14);

    const session = { 
      _id: sessionID,
      creationIP: request.socket.remoteAddress,
      userID: userData._id,
      expirationDate
    };
    
    await database.collection("sessions").insertOne(session);

    // Return a 201 success, and a JSON response body with the session data.
    response.status(201).json({
      ...session,
      token: sessionToken
    });

  } catch (error: unknown) {

    console.error(error);

    response.status(500).json({
      message: "Something bad happened on our side. Try again later.",
    });

    return;
  }

});

export default createSessionRouter;
