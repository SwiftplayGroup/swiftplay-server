

//Get all likes
router.get("/", async (req, res) => {
  try {
    const docs = await database.collection("likes").find().toArray();
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});