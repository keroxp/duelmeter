import update, { Spec } from "immutability-helper";
import React, { useReducer } from "react";
import { Button, Dropdown, Form, Table } from "react-bootstrap";
import { createRoot } from "react-dom/client";
import { v4 as uuid } from "uuid";
addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  if (root) {
    createRoot(root).render(<App />);
  }
});
const App = () => {
  const [props, $reduce] = useReducer(
    (state: State, action: Spec<State>) => {
      return update(state, action);
    },
    { results: [] }
  );
  return (
    <Context.Provider value={{ props, $reduce }}>
      <div>
        <ResultTable />
      </div>
    </Context.Provider>
  );
};

type Result = {
  id: string;
  first: boolean;
  win: boolean;
  point: number;
  myDeck: string;
  opDeck: string;
  timestamp: number;
};

type State = {
  results: Result[];
};
const Context = React.createContext<{
  props: State;
  $reduce: (a: Spec<State>) => void;
}>({ props: { results: [] }, $reduce: () => {} });

const ResultTable = () => {
  const { props: state, $reduce } = React.useContext(Context);
  return (
    <Table striped bordered>
      <thead>
        <tr>
          <th>日時</th>
          <th>先後</th>
          <th>勝敗</th>
          <th>自分</th>
          <th>相手</th>
          <th>ポイント</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <InputForm />
        {state.results.map((result) => {
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
                        if (confirm("削除しますか？"))
                          $reduce({
                            results: {
                              $splice: [[state.results.indexOf(result), 1]],
                            },
                          });
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

const InputForm = () => {
  const { props, $reduce } = React.useContext(Context);
  const [state, dispatch] = useReducer(
    (state: Parital<Result>, action: Partial<Result>) => {
      return { ...state, ...action };
    },
    { id: "", point: 1000, win: true, first: true }
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
          <option value="">（自分）</option>
          <option>One</option>
          <option>Two</option>
          <option>Three</option>
        </Form.Select>
      </td>
      <td>
        <Form.Select
          onChange={(e) => {
            dispatch({ opDeck: e.target.value });
          }}
        >
          <option value="">（相手）</option>
          <option>One</option>
          <option>Two</option>
          <option>Three</option>
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
          onClick={() => {
            const result: Result = {
              first: state.first ?? true,
              win: state.win ?? true,
              point: state.point ?? 1000,
              myDeck: state.myDeck ?? "自分",
              opDeck: state.opDeck ?? "相手",
              timestamp: new Date().getTime(),
            };
            $reduce({ results: { $unshift: [result] } });
          }}
        >
          <span>保存</span>
        </Button>
      </td>
    </tr>
  );
};
