#!/bin/sh
//bin/true; exec deno run -A "$0" "$@"

import docopt from "https://deno.land/x/docopt@v1.0.1/dist/docopt.mjs";

import { bold, cyan, gray } from "https://deno.land/std/fmt/colors.ts";

import { BorgDB } from "../utils/db.ts";
import { borgSync } from "./borg-sync.ts";

export type Reporter = "json" | "verbose";

class Reporters {
  static json(bookmark: any) {
    console.log(JSON.stringify(bookmark));
  }
  static verbose(bookmark: any) {
    let domain
    try {
      const parsed = new URL(bookmark.url)
      domain = `${parsed.protocol}//${parsed.hostname}`;
    } catch (err) {
      domain = "unknown"
    }

    console.log([
      `id:     ${bold(bookmark.id)}`,
      `url:    ${cyan(bookmark.url)}`,
      `domain: ${gray(domain)}`,
      "date:   " + bookmark.created_at,
      "",
    ].join("\n"));
  }
}

export const BORG_LIST_CLI = `
Usage:
  borg list [--reporter=<reporter>] [--db=<db>]

Description:
  List all bookmarks

Options
  --db=<db>              Database to use [default: /home/rg/.borg.db]
  --reporter=<reporter>  Reporter to use [default: json]
  -h, --help             Show this screen.
`;

export async function borgList(argv: string) {
  const args = docopt(BORG_LIST_CLI, { argv, allowExtra: true });

  const db = new BorgDB(args["--db"]);
  db.createTables();

  await borgSync(args["--db"]);

  for (const bookmark of db.getBookmarks()) {
    if (args["--reporter"] === "verbose") {
      Reporters.verbose(bookmark);
    } else if (args["--reporter"] === "json") {
      Reporters.json(bookmark);
    }
  }
}
