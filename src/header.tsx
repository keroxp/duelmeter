import React from "react";
import { Container, Navbar } from "react-bootstrap";

export const Header = () => {
  return (
    <Navbar bg="dark" variant="dark" className="mb-3">
      <Container>
        <Navbar.Brand href="#home">Duel Meter</Navbar.Brand>
        <Navbar.Collapse>
          <Navbar.Text>
            <a href="#login">Login</a>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
