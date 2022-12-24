
import { DB } from "https://deno.land/x/sqlite/mod.ts";

import { Event } from '../types.ts'

const tables = [
  `create table if not exists bookmarks (
    id         text not null primary key,
    url        text not null,
    created_at text not null
  )`,
  `create table if not exists metadata (
    key   text not null primary key,
    value text not null
  )`,
];

export class BorgDB {
  fpath: string;
  db: DB;

  constructor(fpath: string) {
    this.db = new DB(fpath);
    this.fpath = fpath;
  }

  createTables(): void {
    for (const table of tables) {
      this.db.query(table);
    }
  }

  addBookmark(event: Event): void {
    if (typeof event.data === "string") {
      const content = JSON.parse(event.data);
      const { url, id, created_at } = content;
      this.db.query(`insert or replace into bookmarks (id, url, created_at) values (?, ?, ?)`, [id, url, created_at]);
    } else {
      const { url, id, created_at } = event.data;
      this.db.query(`insert or replace into bookmarks (id, url, created_at) values (?, ?, ?)`, [id, url, created_at]);
    }
  }

  getBookmarks() {
    return this.db.query(`select * from bookmarks`).map((row) => {
      return { id: row[0], url: row[1], created_at: row[2] };
    })
  }

  getBookmarkCount(): number {
    return this.db.query(`select count(*) from bookmarks`)[0][0] as number;
  }

  getMaxId(): string | undefined {
    const row = this.db.query(`select value from metadata where key = ?`, ["maxId"]);

    if (row.length > 0) {
      return row[0][0] as string;
    }
  }

  updateMaxId(maxId: string): void {
    this.db.query(`insert or replace into metadata (key, value) values (?, ?)`, ["maxId", maxId]);
  }
}
