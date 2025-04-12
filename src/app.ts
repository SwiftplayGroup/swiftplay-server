import express from "express";
import accountRouter from "./routes/account.js";
import accountsRouter from "./routes/accounts.js";
import runsRouter from "./routes/runs.js";
import gamePagesRouter from "./routes/game-pages.js";
import forumsRouter from "./routes/forums.js";
import threadsRouter from "./routes/threads.js";
import likesRouter from "./routes/likes.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.disable("x-powered-by");
app.use("/runs", runsRouter);
app.use("/account", accountRouter);
app.use("/accounts", accountsRouter);
app.use("/game-pages", gamePagesRouter);
app.use("/forums", forumsRouter);
app.use("/threads", threadsRouter);
app.use("/likes", likesRouter);

app.get("/", (_, response) => response.json({ success: true }));

const port = process.env.PORT;
app.listen(port, () =>
  console.log(`\x1b[32mNow listening on port ${port}.\x1b[0m`),
);
