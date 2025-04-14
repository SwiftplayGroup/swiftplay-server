import { Router, Request } from "express";
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

const router = Router({ mergeParams: true });

// Get all likes from a user
router.get("/", async (req: Request<{ accountID: string }>, res) => {
  try {
    const accountID = req.params.accountID;

    if (!ObjectId.isValid(accountID)) {
      return res.status(400).send("Invalid user ID");
    }

    const likes = await database
      .collection("likes")
      .find({ userId: new ObjectId(accountID) })
      .toArray();

    res.send(likes);
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).send("Internal server error");
  }
});

export default router;
