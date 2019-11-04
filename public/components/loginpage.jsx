import React from "react";
import { LoginForm, RegisterForm } from "./login";

class LoginPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { showRegister: false };
    this.togglePrompts = this.togglePrompts.bind(this);
  }

  togglePrompts() {
    this.setState({ showRegister: !this.state.showRegister });
  }

  render() {
    if (this.state.showRegister) {
      return (
        <RegisterForm show={true} onClose={this.togglePrompts}></RegisterForm>
      );
    } else {
      return <LoginForm show={true} onClose={this.togglePrompts}></LoginForm>;
    }
  }
}

export default LoginPage;
