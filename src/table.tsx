import React, { FC } from "react";
import { Button, Dropdown, Form, Table } from "react-bootstrap";
import { useStore } from "./app";
import { DuelResult } from "./db";
import { useFilteredRuselts, usePatcher } from "./util";

export const ResultTable = () => {
  const { $di, $reduce } = useStore();
  const results = useFilteredRuselts();
  return (
    <Table striped bordered>
      <thead>
        <tr>
          <th>日時</th>
          <th>大会</th>
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
        <InputForm
          onSave={async (part) => {
            await $di.get("duelResultRepo").add({
              ...part,
              timestamp: new Date().getTime(),
            });
          }}
        />
        {results.map((result) => {
          return <ResultRow key={result.id} result={result} />;
        })}
      </tbody>
    </Table>
  );
};

const ResultRow: FC<{ result: DuelResult }> = ({ result }) => {
  const { $di } = useStore();
  const [edit, setEdit] = React.useState(false);
  if (edit) {
    return (
      <InputForm
        result={result}
        editDatetime={true}
        onSave={async (part) => {
          return $di
            .get("duelResultRepo")
            .update({ ...result, ...part })
            .then(() => {
              setEdit(false);
            });
        }}
      />
    );
  } else {
    return <EditRow result={result} onSetEdit={setEdit} />;
  }
};

const EditRow: FC<{
  result: DuelResult;
  onSetEdit: (edit: boolean) => void;
}> = ({ result, onSetEdit }) => {
  const { $di } = useStore();
  return (
    <tr key={result.id}>
      <td>{new Date(result.timestamp).toLocaleString()}</td>
      <td>{result.tournament ?? ""}</td>
      <td>{<span>{result.first ? "先行" : "後攻"}</span>}</td>
      <td>
        <span style={result.win ? { color: "blue" } : { color: "red" }}>
          {result.win ? "勝ち" : "負け"}
        </span>
      </td>
      <td>
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          {result.myDeck}
        </div>
      </td>
      <td>{result.opDeck}</td>
      <td>
        <span style={{ color: result.point > 0 ? "blue" : "red" }}>
          {result.point}
        </span>
      </td>
      <td>
        <Dropdown>
          <Dropdown.Toggle variant="secondary">
            <span>...</span>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              onClick={() => {
                onSetEdit(true);
              }}
            >
              編集
            </Dropdown.Item>
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
};

const kDefaultDeckName = "その他";
type EditDuelResult = Pick<
  DuelResult,
  "first" | "win" | "point" | "myDeck" | "opDeck" | "timestamp" | "tournament"
>;
export const InputForm: FC<{
  result?: EditDuelResult;
  editDatetime?: boolean;
  onSave(part: EditDuelResult): Promise<void>;
}> = ({ result, editDatetime, onSave }) => {
  const { myDecks, opDecks } = useStore();
  const [state, dispatch] = usePatcher<EditDuelResult>(
    result ?? {
      point: 1000,
      win: true,
      first: true,
      timestamp: new Date().getTime(),
      myDeck: kDefaultDeckName,
      opDeck: kDefaultDeckName,
      tournament: "",
    }
  );
  return (
    <tr>
      <td>
        {editDatetime && (
          <>
            <Form.Control
              type="datetime-local"
              // no ms
              value={new Date(state.timestamp).toISOString().slice(0, -8)}
              onChange={(e) => {
                dispatch({ timestamp: new Date(e.target.value).getTime() });
              }}
            ></Form.Control>
          </>
        )}
      </td>
      <td>
        <Form.Control
          type="text"
          placeholder="大会名"
          aria-label="大会名"
          value={state.tournament}
          onChange={(e) => {
            dispatch({ tournament: e.target.value });
          }}
        ></Form.Control>
      </td>
      <td>
        <Form.Select
          id="select-first"
          value={state.first ? "先行" : "後攻"}
          onChange={(e) => {
            dispatch({ first: e.target.value === "先行" });
          }}
        >
          <option value="先行">先行</option>
          <option value="後攻">後攻</option>
        </Form.Select>
      </td>
      <td>
        <Form.Select
          id="select-win"
          value={state.win ? "win" : "lose"}
          onChange={(e) => {
            const win = e.target.value === "win";
            dispatch({
              win,
              point: state.point * (win ? 1 : -1),
            });
          }}
        >
          <option value={"win"}>勝ち</option>
          <option value={"lose"}>敗け</option>
        </Form.Select>
      </td>
      <td>
        <Form.Select
          value={state.myDeck}
          onChange={(e) => {
            dispatch({ myDeck: e.target.value });
          }}
        >
          <option value={kDefaultDeckName}>{kDefaultDeckName}</option>
          {Object.values(myDecks.byId).map((deck) => (
            <option key={deck.name} value={deck.name}>
              {deck.name}
            </option>
          ))}
        </Form.Select>
      </td>
      <td>
        <Form.Select
          value={state.opDeck}
          onChange={(e) => {
            dispatch({ opDeck: e.target.value });
          }}
        >
          <option value={kDefaultDeckName}>{kDefaultDeckName}</option>
          {Object.values(opDecks.byId).map((deck) => (
            <option key={deck.name} value={deck.name}>
              {deck.name}
            </option>
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
          onClick={() => {
            onSave(state).then(() => {
              dispatch({
                point: 1000,
                win: true,
                first: true,
                opDeck: kDefaultDeckName,
              });
            });
          }}
        >
          <span>保存</span>
        </Button>
      </td>
    </tr>
  );
};
