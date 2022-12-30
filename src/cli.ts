#!/bin/sh
//bin/true; exec /home/rg/.deno/bin/deno run -A "$0" "$@"

import { bold, cyan, gray } from "https://deno.land/std/fmt/colors.ts";

import { borgSync } from "./commands/borg-sync.ts";
import { borgList } from "./commands/borg-list.ts";
import { borgStats } from "./commands/borg-stat.ts";
import { borgExport } from "./commands/borg-export.ts";
import { borgImport } from "./commands/borg-import.ts";

export const CLI = `
${bold("borg")}
${gray("---------------------------------------------")}

Sync bookmarks
  ${cyan("borg sync")}
List bookmarks
  ${cyan("borg list")}
Export bookmarks
  ${cyan("borg export")}
Show stats
  ${cyan("borg stats")}

${gray("---------------------------------------------")}
${
  gray("borg sync") + cyan(" • ") + gray("borg list") + cyan(" • ") +
  gray("borg stats") + cyan(" • ") + gray("borg export")
}
`;

const commands: Record<string, any> = {
  sync: borgSync,
  list: borgList,
  stats: borgStats,
  export: borgExport,
  import: borgImport,
};

const [command] = Deno.args;

if (commands.hasOwnProperty(command)) {
  await commands[command](Deno.args);
} else {
  console.log(CLI);
  Deno.exit(1);
}
