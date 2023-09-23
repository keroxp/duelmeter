import update, { Spec } from "immutability-helper";
import { Reducer, useMemo, useReducer } from "react";
import { useStore } from "./app";

export function useOrex<T, I = never>(i: I, init: (i: I) => T) {
  return useReducer<Reducer<T, Spec<T>>, I>(
    (state: T, action: Spec<T>) => update(state, action),
    i,
    init
  );
}

export function usePatcher<T>(state: T) {
  return useReducer(
    (state: T, action: Partial<T>) => ({ ...state, ...action }),
    state
  );
}
export function useFilteredRuselts() {
  const { duelResults, filter } = useStore();
  return useMemo(() => {
    return Object.values(duelResults.byId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .filter((v) => {
        if (
          filter.startDatetime &&
          v.timestamp < new Date(filter.startDatetime).getTime()
        ) {
          return false;
        }
        if (
          filter.endDatetime &&
          v.timestamp > new Date(filter.endDatetime).getTime()
        ) {
          return false;
        }
        if (
          filter.tournament &&
          !(v.tournament ?? "").match(filter.tournament)
        ) {
          return false;
        }
        if (filter.myDeck && v.myDeck !== filter.myDeck) {
          return false;
        }
        if (filter.opDeck && v.opDeck !== filter.opDeck) {
          return false;
        }
        return true;
      });
  }, [
    duelResults.byId,
    filter.startDatetime,
    filter.endDatetime,
    filter.tournament,
    filter.myDeck,
    filter.opDeck,
  ]);
}
