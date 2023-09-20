import React, { useReducer } from "react";
import { Button, Dropdown, Form, Table } from "react-bootstrap";
import { useStore } from "./app";
import { DuelResult } from "./db";

export const ResultTable = () => {
  const { duelResults, $di, $reduce } = useStore();
  const results = Object.values(duelResults.byId).sort(
    (a, b) => b.timestamp - a.timestamp
  );
  return (
    <Table striped bordered>
      <thead>
        <tr>
          <th>日時</th>
          <th>先後</th>
          <th>勝敗</th>
          <th>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                <span>自分のデッキ</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    $reduce({ deckModal: { $set: "my" } });
                  }}
                >
                  編集
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </th>
          <th>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                <span>相手のデッキ</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    $reduce({ deckModal: { $set: "op" } });
                  }}
                >
                  編集
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </th>
          <th>ポイント</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <InputForm />
        {results.map((result) => {
          return (
            <tr>
              <td>{new Date(result.timestamp).toLocaleString()}</td>
              <td>{result.first ? "先行" : "後攻"}</td>
              <td>{result.win ? "勝ち" : "負け"}</td>
              <td>{result.myDeck}</td>
              <td>{result.opDeck}</td>
              <td>
                <span style={{ color: result.point > 0 ? "blue" : "red" }}>
                  {result.point}
                </span>
              </td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    <span>...</span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => {}}>編集</Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        if (confirm("削除しますか？")) {
                          $di.get("duelResultRepo").delete(result.id);
                        }
                      }}
                    >
                      削除
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export const InputForm = () => {
  const { myDecks, opDecks, $di } = useStore();
  type State = Pick<
    DuelResult,
    "first" | "win" | "point" | "myDeck" | "opDeck"
  >;
  const [state, dispatch] = useReducer(
    (state: State, action: Partial<State>) => {
      return { ...state, ...action };
    },
    {
      point: 1000,
      win: true,
      first: true,
      myDeck: "",
      opDeck: "",
    }
  );
  return (
    <tr>
      <td></td>
      <td>
        <Form.Select
          id="select-first"
          required
          aria-label="Default select example"
          onChange={(e) => {
            dispatch({ first: e.target.value === "先行" });
          }}
        >
          <option selected={state.first == null}>（先後）</option>
          <option selected={state.first}>先行</option>
          <option selected={state.first == false}>後攻</option>
        </Form.Select>
      </td>
      <td>
        <Form.Select
          id="select-win"
          required
          aria-label="Default select example"
          onChange={(e) => {
            const win = e.target.value && e.target.value === "win";
            if (e.target.value === "win" || e.target.value === "lose") {
              dispatch({
                win: e.target.value === "win",
                point: (state.point ?? 1000) * (win ? 1 : -1),
              });
            } else {
              dispatch({ win: undefined });
            }
          }}
        >
          <option selected={state.win == null}>（勝敗）</option>
          <option value={"win"} selected={state.win}>
            勝ち
          </option>
          <option value={"lose"} selected={state.win == false}>
            敗け
          </option>
        </Form.Select>
      </td>
      <td>
        <Form.Select
          required
          onChange={(e) => {
            dispatch({ myDeck: e.target.value });
          }}
        >
          <option value="">その他</option>
          {Object.values(myDecks.byId).map((deck) => (
            <option value={deck.name}>{deck.name}</option>
          ))}
        </Form.Select>
      </td>
      <td>
        <Form.Select
          onChange={(e) => {
            dispatch({ opDeck: e.target.value });
          }}
        >
          <option value="その他">その他</option>
          {Object.values(opDecks.byId).map((deck) => (
            <option value={deck.name}>{deck.name}</option>
          ))}
        </Form.Select>
      </td>
      <td>
        <Form.Control
          type="number"
          placeholder="ポイント"
          aria-label="ポイント"
          value={state.point}
          onChange={(e) => {
            dispatch({ point: parseInt(e.target.value) });
          }}
        ></Form.Control>
      </td>
      <td>
        <Button
          disabled={
            state.first == null || state.win == null || state.point == null
          }
          onClick={async () => {
            await $di
              .get("duelResultRepo")
              .add({
                ...state,
                timestamp: new Date().getTime(),
              })
              .then(() => {
                dispatch({ point: 1000, win: true, first: true, opDeck: "" });
              });
          }}
        >
          <span>保存</span>
        </Button>
      </td>
    </tr>
  );
};
