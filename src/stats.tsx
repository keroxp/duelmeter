import React, { useMemo } from "react";
import {
  Col,
  Container,
  FloatingLabel,
  Form,
  Row,
  Table,
} from "react-bootstrap";
import { useStore } from "./app";

export const Stats = () => {
  const { duelResults } = useStore();
  const results = Object.values(duelResults.byId).sort(
    (a, b) => b.timestamp - a.timestamp
  );
  const a = useMemo(() => {
    const totalCnt = results.length;
    const winCnt = results.filter((r) => r.win).length;
    const winRate = winCnt / totalCnt;
    const duelsFirst = results.filter((r) => r.first);
    const duelsSecond = results.filter((r) => !r.first);
    const winRateFirst =
      duelsFirst.filter((r) => r.win).length / duelsFirst.length;
    const winRateSecond =
      duelsSecond.filter((r) => r.win).length / duelsSecond.length;
    return { winRate, winRateFirst, winRateSecond };
  }, [results]);
  return (
    <Container>
      <Row className="mb-3">
        <Form.Group as={Col}>
          <FloatingLabel controlId="floatingInput" label="開始日">
            <Form.Control type="date" />
          </FloatingLabel>
        </Form.Group>
        <Form.Group as={Col}>
          <FloatingLabel controlId="floatingInput" label="開始時刻">
            <Form.Control type="time" />
          </FloatingLabel>
        </Form.Group>
      </Row>
      <Row className="mb-3">
        <Form.Group as={Col}>
          <FloatingLabel controlId="floatingInput" label="終了日">
            <Form.Control type="date"></Form.Control>
          </FloatingLabel>
        </Form.Group>
        <Form.Group as={Col}>
          <FloatingLabel controlId="floatingInput" label="終了時刻">
            <Form.Control type="time" />
          </FloatingLabel>
        </Form.Group>
      </Row>
      <Table striped bordered>
        <tbody>
          <tr>
            <td>勝率</td>
            <td>{a.winRate.toFixed(3)}</td>
          </tr>
          <tr>
            <td>先攻勝率</td>
            <td>{a.winRateFirst.toFixed(3)}</td>
          </tr>
          <tr>
            <td>後攻勝率</td>
            <td>{a.winRateSecond.toFixed(3)}</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};
