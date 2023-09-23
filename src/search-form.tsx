import React, { FC } from "react";
import {
  Button,
  Col,
  FloatingLabel,
  Form,
  InputGroup,
  Row,
} from "react-bootstrap";
import { useStore } from "./app";
import { Deck } from "./db";
export const SearchForm: FC<{}> = ({}) => {
  const { filter, myDecks, opDecks, $reduce } = useStore();
  return (
    <Row className="mb-3">
      <Form.Group as={Col}>
        <FloatingLabel controlId="floatingInput" label="開始日">
          <Form.Control
            type="datetime-local"
            value={filter?.startDatetime ?? ""}
            onChange={(e) => {
              $reduce({
                filter: {
                  startDatetime: { $set: e.target.value },
                },
              });
            }}
          />
        </FloatingLabel>
      </Form.Group>
      <Form.Group as={Col}>
        <FloatingLabel controlId="floatingInput" label="終了日">
          <Form.Control
            type="datetime-local"
            value={filter?.endDatetime ?? ""}
            onChange={(e) => {
              $reduce({
                filter: {
                  endDatetime: { $set: e.target.value },
                },
              });
            }}
          ></Form.Control>
        </FloatingLabel>
      </Form.Group>
      <Form.Group as={Col}>
        <FloatingLabel controlId="floatingInput" label="大会名">
          <Form.Control
            type="text"
            value={filter?.tournament ?? ""}
            onChange={(e) => {
              $reduce({
                filter: {
                  tournament: { $set: e.target.value },
                },
              });
            }}
          />
        </FloatingLabel>
      </Form.Group>
      <DeckFilter
        label={"自分のデッキ"}
        decks={Object.values(myDecks.byId)}
        value={filter?.myDeck ?? ""}
        onChange={(v) => {
          $reduce({
            filter: {
              myDeck: { $set: v },
            },
          });
        }}
      />
      <DeckFilter
        label={"相手のデッキ"}
        decks={Object.values(opDecks.byId)}
        value={filter?.opDeck ?? ""}
        onChange={(v) => {
          $reduce({
            filter: {
              opDeck: { $set: v },
            },
          });
        }}
      />
      <Col>
        <Button
          variant="secondary"
          onClick={() => {
            $reduce({
              filter: { $set: {} },
            });
          }}
        >
          クリア
        </Button>
      </Col>
    </Row>
  );
};

const DeckFilter = ({
  label,
  decks,
  value,
  onChange,
}: {
  label: string;
  decks: Deck[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const [mode, setMode] = React.useState<"select" | "input">("select");
  return (
    <Form.Group as={Col}>
      <InputGroup>
        <FloatingLabel controlId={"floatingInputOp"} label={label}>
          {mode === "select" ? (
            <Form.Select
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
              }}
            >
              <option value={""}>全て</option>
              {decks.map((deck) => (
                <option key={deck.name} value={deck.name}>
                  {deck.name}
                </option>
              ))}
            </Form.Select>
          ) : (
            <Form.Control
              type="text"
              placeholder="デッキ名"
              aria-label="デッキ名"
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
              }}
            ></Form.Control>
          )}
        </FloatingLabel>
        <Button
          variant="secondary"
          onClick={() => setMode(mode === "select" ? "input" : "select")}
        >
          <i className="bi bi-plus"></i>
        </Button>
      </InputGroup>
    </Form.Group>
  );
};
