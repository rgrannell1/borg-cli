#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";
import { BorgDB } from "../utils/db.ts";
import { borgSync } from "./borg-sync.ts";

export const BORG_EXPORT_CLI = `
Usage:
  borg export [--db=<db>]

Description:
  Export all bookmarks

Options:
  --db=<db>              Database to use [default: /home/rg/.borg.db]
  -h, --help             Show this screen.
`;

export async function borgExport(argv: string) {
  const args = docopt(BORG_EXPORT_CLI, { argv, allowExtra: true });

  const db = new BorgDB(args["--db"]);
  db.createTables();

  await borgSync(args["--db"]);

  const bookmarks = db.getBookmarks();

  for (const bookmark of bookmarks) {
    const entity = {
      id: bookmark.id,
      is: ["Bookmark"],
      source: "Borg",
      url: bookmark.url,
      created_at: bookmark.created_at,
    };

    console.log(JSON.stringify(entity));
  }
}
