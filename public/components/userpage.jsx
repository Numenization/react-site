import React from "react";
import { Redirect } from "react-router-dom";
import queryString from "query-string";
import Modal from "./modal";

class UserPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      queryValues: this.props.location.search,
      user: null,
      error: null,
      showModal: false
    };

    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
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

  updateUser() {
    if (!this.state.user || !this.state.user.id) {
      return;
    }

    const newUsername = document.getElementById("username-input").value;
    const newEmail = document.getElementById("email-input").value;

    fetch("/api/users/", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: this.state.user.id,
        username: newUsername,
        email: newEmail
      })
    })
      .then(res => {
        if (res.ok) return res.json();
        else return Promise.reject(Error("Failed to update user"));
      })
      .then(body => {
        console.log(body);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        this.closeModal();
        this.getUserInfo();
      });
  }

  showModal() {
    this.setState({
      queryValues: this.state.queryValues,
      user: this.state.user,
      err: this.state.err,
      showModal: true
    });
  }

  closeModal() {
    this.setState({
      queryValues: this.state.queryValues,
      user: this.state.user,
      err: this.state.err,
      showModal: false
    });
  }

  componentDidMount() {
    this.getUserInfo();
  }

  getUserInfo() {
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
          error: this.state.error,
          showModal: this.state.showModal
        });
      })
      .catch(err => {
        this.setState({
          queryValues: this.state.queryValues,
          user: this.state.user,
          error: err,
          showModal: this.state.showModal
        });
      });
  }

  render() {
    const modalInner = this.state.user ? (
      <div>
        <h1>Update username/email</h1>
        <div className="userpage-modal-form">
          <label>Username:</label>
          <input id="username-input" type="text"></input>
          <label>Email:</label>
          <input id="email-input" type="text"></input>
          <button className="normal-button" onClick={this.updateUser}>
            Update User
          </button>
        </div>
      </div>
    ) : null;

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
          <Modal
            show={this.state.showModal}
            onClose={this.closeModal}
            style={{ width: "30%" }}
          >
            {modalInner}
          </Modal>
          <h3>ID: {this.state.user.rowid}</h3>
          <h3>UUID: {this.state.user.id}</h3>
          <h3>Username: {this.state.user.username}</h3>
          <h3>Email: {this.state.user.email}</h3>
          <button className="normal-button" onClick={this.deleteUser}>
            Delete User
          </button>
          <button className="normal-button" onClick={this.showModal}>
            Update User
          </button>
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
