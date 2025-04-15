//make a like
router.post("/", async (req, res) => {
  try {
    const { userId, threadId } = req.body;
    const forum = await database.collection("likes").insertOne({
      _id: new ObjectId(),
      userId,
      threadId,
      createdAt: new Date(),
    });
    res.status(201).json(forum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});