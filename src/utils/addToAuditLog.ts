
import database from "#utils/database-generator.js";
import { ObjectId } from "mongodb";

export type EventName = (
  "accounts.edit" | 
  "games.categories.create" | 
  "games.categories.delete" | 
  "games.categories.edit" | 
  "games.create" | 
  "games.delete" | 
  "games.edit" |
  "games.runs.create" |
  "games.runs.edit" |
  "groups.create" |
  "groups.delete" |
  "groups.join" |
  "groups.members.add" |
  "groups.members.join" |
  "groups.members.remove" |
  "groups.members.leave"
)

async function addToAuditLog(eventName: EventName, actorID: ObjectId, targetID: ObjectId, sessionID?: ObjectId) {

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