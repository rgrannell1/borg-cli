#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";
import { BorgDB } from "../utils/db.ts";
import { API } from "https://raw.githubusercontent.com/rgrannell1/common-storage/main/src/client/api.ts";

import { parseNdjson } from "https://deno.land/x/ndjson@v1.0.7/mod.ts";

const client = new API();

export const BORG_IMPORT_CLI = `
Usage:
  borg import [--db=<db>] <file>

Description:
  Import bookmarks from a local file into borg

Arguments:
  <file>                 File to import

Options:
  --db=<db>              Database to use [default: /home/rg/.borg.db]
  -h, --help             Show this screen.
`;

export async function borgImport(argv: string) {
  const args = docopt(BORG_IMPORT_CLI, { argv, allowExtra: true });

  const db = new BorgDB(args["--db"]);
  db.createTables();

  if (args["<file>"] === "-") {
    for await (const bookmark of parseNdjson(Deno.stdin)) {
      // check valid
    }
  } else {

  }

  // read stdin or file
}
