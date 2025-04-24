import { GoogleGenAI } from "@google/genai";
import { Router, Request } from "express";
import { ObjectId } from "mongodb";
import database from "#utils/database-generator.js";
import { UserNotFoundError } from "#classes/errors/UserNotFoundError.js";
import { BadRequestError } from "#classes/errors/BadRequestError.js";

const updateEmbeddingsRouter = Router({ mergeParams: true });

updateEmbeddingsRouter.patch(
  "/",
  async (
    req: Request<{ userID: string }, unknown, { embedString: string }>,
    res,
  ) => {
    try {
      const embedString = req.body.embedString;

      console.log(embedString);
      console.log(req.body.embedString);
      if (typeof embedString !== "string" || !embedString.trim()) {
        throw new BadRequestError("Text must be a non-empty string");
      }

      const user = await database
        .collection("users")
        .findOne({ _id: new ObjectId(req.params.userID) });
      if (!user) {
        throw new UserNotFoundError(req.params.userID);
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const embedResult = await ai.models.embedContent({
        model: "gemini-embedding-exp-03-07",
        contents: embedString,
      });
      console.log(embedResult);

      const embeddings = embedResult.embeddings;

      await database
        .collection("users")
        .updateOne({ _id: user._id }, { $set: { embeddings } });

      res.status(200).json({ message: "Embeddings updated successfully" });
    } catch (error) {
      console.error(error);
      if (
        error instanceof BadRequestError ||
        error instanceof UserNotFoundError
      ) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  },
);

export default updateEmbeddingsRouter;
