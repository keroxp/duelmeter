import { DI } from "@keroxp/dino";
import Dexie from "dexie";
import { Deps } from "./di";
import { v4 as uuid } from "uuid";
export type DuelResult = {
  id: string;
  first: boolean;
  win: boolean;
  point: number;
  myDeck: string;
  opDeck: string;
  timestamp: number;
};

export interface AppDB extends Dexie {
  results: Dexie.Table<DuelResult, string>;
  myDecks: Dexie.Table<Deck, string>;
  opDecks: Dexie.Table<Deck, string>;
}
export type Deck = {
  id: string;
  name: string;
};

export function createDb(): AppDB {
  const db = new Dexie("myDb") as AppDB;
  db.version(1).stores({
    results: "&id,first,win,myDeck,opDeck,point,timestamp",
    myDecks: "&id,&name",
    opDecks: "&id,&name",
  });
  return db;
}

abstract class BaseRepository {
  constructor(private di: DI<Deps>) {}
  protected get deps() {
    const db = this.di.get("db");
    const $reduce = this.di.get("$reduce");
    return { db, $reduce };
  }
  protected get $reduce() {
    return this.deps.$reduce;
  }
  protected get db() {
    return this.deps.db;
  }
}

export class DuelResultRepository extends BaseRepository {
  async load() {
    const list = await this.db.results.toArray();
    const items = list.filter((r) => r.id != null).map((r) => [r.id!, r]);
    this.$reduce({
      duelResults: {
        byId: {
          $set: Object.fromEntries(items),
        },
      },
    });
  }
  async add(result: Omit<DuelResult, "id">) {
    const id = await this.db.results.add({
      ...result,
      id: uuid(),
    });
    const entry = { ...result, id };
    this.$reduce({
      duelResults: {
        byId: { [id]: { $set: entry } },
      },
    });
  }
  async update(result: DuelResult): Promise<void> {
    await this.db.results.update(result.id, result);
    this.$reduce({
      duelResults: {
        byId: { [result.id]: { $set: result } },
      },
    });
  }
  async delete(id: string): Promise<void> {
    await this.db.results.delete(id);
    this.$reduce({
      duelResults: {
        byId: { $unset: [id] },
      },
    });
  }
}

export class DeckRepository extends BaseRepository {
  constructor(di: DI<Deps>, private tableName: "myDecks" | "opDecks") {
    super(di);
  }
  async load() {
    const list = await this.db[this.tableName].toArray();
    this.$reduce({
      [this.tableName]: {
        byId: {
          $set: list.reduce((acc, cur) => ({ ...acc, [cur.id]: cur }), {}),
        },
      },
    });
  }
  async add(deck: Omit<Deck, "id">) {
    const entry = { ...deck, id: uuid() };
    const id = await this.db[this.tableName].add(entry);
    this.$reduce({
      [this.tableName]: { byId: { [id]: { $set: entry } } },
    });
  }
  async update(deck: Deck): Promise<void> {
    await this.db[this.tableName].update(deck.id, deck);
    this.$reduce({
      [this.tableName]: { byId: { [deck.id]: { $set: deck } } },
    });
  }
  async delete(id: string): Promise<void> {
    await this.db[this.tableName].delete(id);
    this.$reduce({
      [this.tableName]: { byId: { $unset: [id] } },
    });
  }
}
