import React, { useMemo } from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { useStore } from "./app";

export const DeckList = () => {
  const { myDecks, opDecks, deckModal, $di, $reduce } = useStore();
  const [newDeck, setNewDeck] = React.useState("");
  const [decks, prefix, repo] = useMemo(() => {
    if (deckModal === "my") {
      return [
        Object.values(myDecks.byId).sort((a, b) => a.updatedAt - b.updatedAt),
        "自分の",
        $di.get("myDeckRepo"),
      ];
    } else {
      return [
        Object.values(opDecks.byId).sort((a, b) => a.updatedAt - b.updatedAt),
        "相手の",
        $di.get("opDeckRepo"),
      ];
    }
  }, [deckModal, myDecks, opDecks]);
  return (
    <Modal
      show={deckModal != null}
      onHide={() => {
        $reduce({ deckModal: { $set: undefined } });
      }}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {prefix}
          デッキを編集
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table striped bordered>
          <thead>
            <tr>
              <th>デッキ名</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {decks.map((deck) => (
              <tr key={deck.id}>
                <td>{deck.name}</td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => {
                      repo.delete(deck.id);
                    }}
                  >
                    削除
                  </Button>
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <Form.Control
                  type="text"
                  value={newDeck}
                  onChange={(e) => {
                    setNewDeck(e.target.value);
                  }}
                />
              </td>
              <td>
                <Button
                  disabled={newDeck === ""}
                  onClick={() => {
                    repo
                      .add({
                        name: newDeck,
                        updatedAt: Date.now(),
                      })
                      .then(() => {
                        setNewDeck("");
                      });
                  }}
                >
                  追加
                </Button>
              </td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};
