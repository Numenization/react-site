import React from "react";
import crypto from "crypto";
import PropTypes from "prop-types";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { email: "", password: "", hashedPass: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit(event) {}

  render() {
    if (!this.props.show) {
      return null;
    }

    return (
      <div id="register-form">
        <h3>User Login</h3>
        <form>
          <label>
            Email:
            <br />
          </label>
          <input
            type="text"
            name="email"
            value={this.state.email}
            onChange={this.handleChange}
          ></input>
          <label>
            Password:
            <br />
          </label>
          <input
            type="password"
            name="password"
            value={this.state.password}
            onChange={this.handleChange}
          ></input>
          <button type="button" value="Log In" onClick={this.handleSubmit}>
            Log In
          </button>
        </form>
        <button className="unstyled-button" onClick={this.props.onClose}>
          Click here to register an account
        </button>
      </div>
    );
  }
}

class RegisterForm extends React.Component {
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
            return res.json();
          })
          .then(body => {
            if (body.error) {
              return Promise.reject(Error(body.error));
            } else {
              console.log(body.message);
            }
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
    if (!this.props.show) {
      return null;
    }

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
        <button className="unstyled-button" onClick={this.props.onClose}>
          Click here to log into existing account
        </button>
      </div>
    );
  }
}

LoginForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node
};

RegisterForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node
};

export { RegisterForm, LoginForm };
