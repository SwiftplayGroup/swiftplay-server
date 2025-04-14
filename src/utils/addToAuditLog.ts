
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

export type EventName = (
  "accounts.edit" | 
  "gamePages.categories.create" | 
  "gamePages.categories.delete" | 
  "gamePages.categories.edit" | 
  "gamePages.create" | 
  "gamePages.delete" | 
  "gamePages.edit" |
  "groups.create" |
  "groups.join"
)

async function addToAuditLog(eventName: EventName, actorID: ObjectId, targetID: ObjectId, sessionID: ObjectId) {

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