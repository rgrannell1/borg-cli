#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

import { BorgDB } from "../utils/db.ts";
import { borgSync } from "./borg-sync.ts";

export const BORG_STAT_CLI = `
Usage:
  borg stats [--reporter=<reporter>] [--db=<db>]

Description:
  Show bookmark stats

Options
  --db=<db>              Database to use [default: /home/rg/.borg.db]
  --reporter=<reporter>  Reporter to use [default: json]
  -h, --help             Show this screen.
`;

export async function borgStats(argv: string) {
  const args = docopt(BORG_STAT_CLI, { argv, allowExtra: true });

  const db = new BorgDB(args["--db"]);
  db.createTables();

  await borgSync(args["--db"]);

  const count = db.getBookmarkCount();
  console.log({ count });
}
