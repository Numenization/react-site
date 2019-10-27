import React from "react";
import crypto from "crypto";

class registerForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { username: "", email: "", password: "", hashedPass: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    const hash = crypto.createHash("sha256");
    const pass = hash.update(this.state.password).digest("hex");
    this.setState(
      {
        username: this.state.username,
        email: this.state.email,
        password: this.state.password,
        hashedPass: pass
      },
      () => {
        console.log(this.state);
        fetch("/api/register", {
          method: "post",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: this.state.username,
            email: this.state.email,
            password: this.state.hashedPass
          })
        })
          .then(res => {
            if (res.ok) return res.json();
            else return new Error("Failed to post registration");
          })
          .then(body => {
            console.log(body);
          })
          .catch(err => {
            console.error(err);
          });
      }
    );
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  render() {
    return (
      <div id="register-form">
        <h3>User Registration</h3>
        <form>
          <label>
            Username:
            <br />
          </label>
          <input
            type="text"
            name="username"
            value={this.state.username}
            onChange={this.handleChange}
          />

          <label>
            Email:
            <br />
          </label>
          <input
            type="text"
            name="email"
            value={this.state.email}
            onChange={this.handleChange}
          />

          <label>
            Password:
            <br />
          </label>
          <input
            type="password"
            name="password"
            value={this.state.password}
            onChange={this.handleChange}
          />
          <button type="button" value="Sign Up" onClick={this.handleSubmit}>
            Sign Up
          </button>
        </form>
      </div>
    );
  }
}

export default registerForm;
