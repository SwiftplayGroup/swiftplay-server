import express from "express";
import accountRouter from "./routes/user/index.js";
import accountsRouter from "./routes/users/index.js";
import runsRouter from "./routes/runs/index.js";
import gamePagesRouter from "./routes/game-pages/index.js";
import groupsRouter from "./routes/groups/index.js";
import forumsRouter from "./routes/forums/index.js";
import threadsRouter from "./routes/threads/index.js";
import likesRouter from "./routes/likes/index.js";
import postsRouter from "./routes/posts/index.js";
import forumIdRouter from "./routes/forums/[forumID]/index.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.disable("x-powered-by");
app.use("/runs", runsRouter);
app.use("/account", accountRouter);
app.use("/accounts", accountsRouter);
app.use("/posts", postsRouter);
app.use("/game-pages", gamePagesRouter);
app.use("/groups", groupsRouter);
app.use("/forums", forumsRouter);
app.use("/forums/:forumId", forumIdRouter);
app.use("/threads", threadsRouter);
app.use("/likes", likesRouter);

app.get("/", (_, response) => response.json({ success: true }));

const port = process.env.PORT;
app.listen(port, () =>
  console.log(`\x1b[32mNow listening on port ${port}.\x1b[0m`),
);
