import { Spec } from "immutability-helper";
import { Store } from "./app";
import { AppDB, DeckRepository, DuelResultRepository } from "./db";

export type Deps = {
  db: AppDB;
  duelResultRepo: DuelResultRepository;
  myDeckRepo: DeckRepository;
  opDeckRepo: DeckRepository;
  $reduce: (action: Spec<Store>) => void;
};
