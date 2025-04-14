import database from "#utils/database-generator.js";
import { Request, Router } from "express";
import authenticator from "#utils/authenticator.js";
import { ObjectId } from "mongodb";

const router = Router({ mergeParams: true });

router.delete("/", authenticator);
router.delete(
  "/",
  async (request: Request<{ sessionID: string }>, response) => {
    // Verify that the user provides a valid session ID in the body.
    const sessionIDString = request.params.sessionID;
    let sessionID;
    const sessionsCollection = database.collection("sessions");
    let sessionFilter;
    try {
      sessionID = new ObjectId(sessionIDString);
      sessionFilter = {
        _id: sessionID,
        accountID: response.locals.user._id,
      };

      if ((await sessionsCollection.countDocuments(sessionFilter)) == 0) {
        throw new Error();
      }
    } catch (error: unknown) {
      console.error(error);

      return response.status(404).json({
        message: "Session not found.",
      });
    }

    try {
      const { deletedCount } =
        await sessionsCollection.deleteOne(sessionFilter);

      if (deletedCount === 0) {
        throw new Error("Unable to delete session.");
      }
    } catch (error) {
      console.error(error);

      return response.status(500).json({
        message: "Something bad happened on our side. Try again later.",
      });
    }

    return response.status(204).json({});
  },
);

export default router;
