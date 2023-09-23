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
import { useFilteredRuselts } from "./util";

export const Stats = () => {
  const { filter, $reduce } = useStore();
  const results = useFilteredRuselts();
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
