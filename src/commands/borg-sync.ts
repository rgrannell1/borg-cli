import { API } from "../../../common-storage/src/client/api.ts";
import { BorgDB } from '../utils/db.ts';

import { Event } from "../types.ts";

const client = new API();

async function* getBookmarkEvents(db: BorgDB, startId?: string) {
  while (true) {
    const res = await client.getContent("bookmarks", startId);
    const data = await res.json();

    if (data.content.length === 0) {
      break;
    }

    for (const event of data.content) {
      yield {
        id: event.id,
        value: event.value,
      };
    }

    startId = data.lastId;
  }
}


function addBookmark(db: BorgDB, event: Event, id: string) {
  db.createTables();

  db.addBookmark(event);
  db.updateMaxId(id);
}

const constants = {
  events: {
    add: "xyz.rgrannell.bookmark.add.v1",
    addLegacy: 'xyz.rgrannell.cs.bookmark.add.v1'
  }
}

export async function processEvents(fpath: string) {
  const db = new BorgDB(fpath);
  db.createTables();

  const startId = db.getMaxId() ?? '0';

  for await (const value of getBookmarkEvents(db, startId)) {
    const event = value.value;

    if (event.type === constants.events.add || event.type === constants.events.addLegacy) {
      addBookmark(db, event, value.id);
    } else {
      console.error('unknown event', event)
    }
  }
}

export async function borgSync(fpath: string) {
  await processEvents(fpath);
}
