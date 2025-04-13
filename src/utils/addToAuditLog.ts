
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

async function addToAuditLog(eventName: "gamePages.create" | "gamePages.delete" | "gamePages.edit", actorID: ObjectId, targetID: ObjectId, sessionID: ObjectId) {

  const eventsCollection = database.collection("events");
  const eventEntry = await eventsCollection.findOne({name: eventName});
  let eventID = eventEntry?._id;
  if (!eventEntry) {

    eventID = (await eventsCollection.insertOne({name: eventName})).insertedId;

  }

  await database.collection("auditLog").insertOne({
    eventID,
    actorID,
    targetID,
    sessionID
  });

}

export default addToAuditLog;