import { DI } from "@keroxp/dino";
import update, { Spec } from "immutability-helper";
import React, { FC, useEffect, useReducer } from "react";
import {
  Deck,
  DeckRepository,
  DuelResult,
  DuelResultRepository,
  createDb,
} from "./db";
import { DeckList } from "./deck";
import { Deps } from "./di";
import { Header } from "./header";
import { ResultTable } from "./table";

export const App: FC<{}> = ({}) => {
  const [props, $reduce] = useReducer(
    (state: Store, action: Spec<Store>) => {
      return update(state, action);
    },
    {
      duelResults: {
        byId: {},
      },
      myDecks: {
        byId: {},
      },
      opDecks: {
        byId: {},
      },
    }
  );
  const $di = React.useMemo(() => {
    const di = new DI<Deps>();
    di.set("db", createDb());
    di.set("myDeckRepo", new DeckRepository(di, "myDecks"));
    di.set("opDeckRepo", new DeckRepository(di, "opDecks"));
    di.set("duelResultRepo", new DuelResultRepository(di));
    di.set("$reduce", $reduce);
    return di;
  }, [$reduce]);
  useEffect(() => {
    Promise.all([
      $di.get("duelResultRepo").load(),
      $di.get("myDeckRepo").load(),
      $di.get("opDeckRepo").load(),
    ]).then(() => {});
  }, []);
  return (
    <Context.Provider value={{ ...props, $di, $reduce }}>
      <div>
        <Header />
        <ResultTable />
        <DeckList />
      </div>
    </Context.Provider>
  );
};

export type Store = {
  deckModal?: "my" | "op";
  myDecks: {
    byId: { [id: string]: Deck };
  };
  opDecks: {
    byId: { [id: string]: Deck };
  };
  duelResults: {
    byId: { [id: string]: DuelResult };
  };
};

type AppContext = Store & {
  $di: DI<Deps>;
  $reduce: (a: Spec<Store>) => void;
};
const Context = React.createContext<AppContext | null>(null);
export function useStore() {
  const ctx = React.useContext(Context);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider.");
  }
  return ctx;
}
