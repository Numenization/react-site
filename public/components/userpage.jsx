import React from "react";
import { Redirect } from "react-router-dom";
import queryString from "query-string";

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryValues: this.props.location.search,
      user: null,
      error: null
    };

    this.deleteUser = this.deleteUser.bind(this);
  }

  deleteUser() {
    if (!this.state.user || !this.state.user.id) {
      return;
    }
    fetch("/api/users/", {
      method: "delete",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: this.state.user.id })
    })
      .then(res => {
        if (res.ok) return res.json();
        else return Promise.reject(Error("Failed to delete user"));
      })
      .then(body => {
        console.log(body);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        window.location = "/";
      });
  }

  componentDidMount() {
    if (!this.state.queryValues) return <Redirect to="/users" />;
    const queryValues = queryString.parse(this.state.queryValues);
    if (!queryValues["id"]) return <Redirect to="/users" />;

    var id = queryValues["id"];
    fetch(`/api/users?id=${id}`, {
      method: "get",
      headers: { "Content-Type": "application/json" }
    })
      .then(res => {
        if (res.ok) return res.json();
        else return Promise.reject(Error(`Could not get user with ID ${id}`));
      })
      .then(body => {
        this.setState({
          queryValues: this.state.queryValues,
          user: JSON.parse(body),
          error: this.state.error
        });
      })
      .catch(err => {
        this.setState({
          queryValues: this.state.queryValues,
          user: this.state.user,
          error: err
        });
      });
  }

  render() {
    if (this.state.error != undefined || this.state.error != null) {
      return (
        <div>
          <h1>Error:</h1>
          <h3>{this.state.error.message}</h3>
        </div>
      );
    } else if (this.state.user != undefined || this.state.user != null) {
      return (
        <div>
          <h3>ID: {this.state.user.rowid}</h3>
          <h3>Username: {this.state.user.username}</h3>
          <h3>Email: {this.state.user.email}</h3>
          <button onClick={this.deleteUser}>Delete User</button>
        </div>
      );
    } else {
      return (
        <div>
          <h3>Loading...</h3>
        </div>
      );
    }
  }
}

export default UserPage;
