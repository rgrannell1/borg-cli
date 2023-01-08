#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";
import { BorgDB } from "../utils/db.ts";
import { API } from "https://raw.githubusercontent.com/rgrannell1/common-storage/main/src/client/api.ts";

import { parseNdjson } from "https://deno.land/x/ndjson@v1.0.7/mod.ts";

const client = new API();

export const BORG_IMPORT_CLI = `
Usage:
  borg import [--db=<db>] [--source=coppermind-pinboard] <file>

Description:
  Import bookmarks from a local file into borg

Arguments:
  <file>                 File to import

Options:
  --db=<db>              Database to use [default: /home/rg/.borg.db]
  --source=<source>      Source format of the bookmarks
  -h, --help             Show this screen.
`;

function validateBookmark(bookmark: any) {
  if (!bookmark.source) {
    throw new Error("bookmark has no source" + JSON.stringify(bookmark));
  }
}

class Transformers {
  static coppermindPinboard(bookmark: any) {
    const date = bookmark.date[0][0];
    const url = bookmark.url[0][0];

    const unix = new Date(date).getTime()
    const now = new Date();
    const id =  `urn:bookmark:${unix}`;

    return {
      source: "https://github.com/rgrannell1/borg/spec/bookmark.json",
      id,
      time: now.toISOString(),
      type: "xyz.rgrannell.bookmark.add.v1",
      specversion: "1.0",
      datacontenttype: "application/json",
      data: JSON.stringify({
        id,
        url,
        created_at: date,
      })
    }
  }
}

export async function borgImport(argv: string) {
  const args = docopt(BORG_IMPORT_CLI, { argv, allowExtra: true });

  const db = new BorgDB(args["--db"]);
  db.createTables();

  const bookmarks: Record<string, any>[] = [];

  if (args["<file>"] === "-") {
    for await (const bookmark of parseNdjson(Deno.stdin)) {
      if (args["--source"] !== "coppermind-pinboard") {
        throw new Error("unsupported source: " + args["--source"]);
      }

      const importable = Transformers.coppermindPinboard(bookmark);
      validateBookmark(importable);
      bookmarks.push(importable);
    }
  } else {
    // TODO: implement
  }

  for (let idx = 0; true; idx += 5) {
    const chunk = bookmarks.slice(idx, idx + 5);
    if (chunk.length === 0) {
      break;
    }

    await client.postContent("bookmarks", chunk as any);
  }
}
