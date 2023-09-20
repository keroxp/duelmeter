import React from "react";
import { Container, Navbar } from "react-bootstrap";

export const Header = () => {
  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home">Duel Point</Navbar.Brand>
        <Navbar.Collapse>
          <Navbar.Text>
            <a href="#login">Login</a>
          </Navbar.Text>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};
