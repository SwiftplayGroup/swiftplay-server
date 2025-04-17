import express from "express";
import userRouter from "./routes/user/index.js";
import usersRouter from "./routes/users/index.js";
import runsRouter from "./routes/runs/index.js";
import gamePagesRouter from "./routes/game-pages/index.js";
import groupsRouter from "./routes/groups/index.js";
import forumsRouter from "./routes/forums/index.js";
import likesRouter from "./routes/likes/index.js";
import postsRouter from "./routes/posts/index.js";
import cors from "cors";
import threadsRouter from "./routes/threads/index.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.disable("x-powered-by");
app.use("/runs", runsRouter);
app.use("/user", userRouter);
app.use("/users", usersRouter);
app.use("/threads", threadsRouter);
app.use("/posts", postsRouter);
app.use("/game-pages", gamePagesRouter);
app.use("/groups", groupsRouter);
app.use("/forums", forumsRouter);
app.use("/likes", likesRouter);

app.get("/", (_, response) => {
  
  response.json({ success: true });

});

const port = process.env.PORT;
app.listen(port, () =>
  console.log(`\x1b[32mNow listening on port ${port}.\x1b[0m`),
);
