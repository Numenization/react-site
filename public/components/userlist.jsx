import React from 'react';
import { Table, TableRow } from './table';
import Modal from './modal';

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: null,
      error: null,
      showModal: false,
      selectedUser: null
    };

    this.rowClick = this.rowClick.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.visitPage = this.visitPage.bind(this);
  }

  rowClick(e) {
    const columnData = JSON.parse(e.target.getAttribute('data-columns'));
    this.setState(
      {
        users: this.state.users,
        error: this.state.error,
        showModal: this.state.showModal,
        selectedUser: columnData
      },
      () => {
        this.toggleModal();
      }
    );
  }

  visitPage() {
    window.location = `user?id=${this.state.selectedUser.id}`;
  }

  toggleModal() {
    this.setState({
      users: this.state.users,
      error: this.state.error,
      showModal: !this.state.showModal,
      selectedUser: this.state.selectedUser
    });
  }

  getUsers() {
    fetch('/api/users/all/', {
      method: 'get',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (res.ok) return res.json();
        else return Promise.reject(Error(`Failed to get users`));
      })
      .then(body => {
        if (body.message) {
          return Promise.reject(Error(body.message));
        }
        this.setState({
          users: JSON.parse(body),
          error: this.state.error,
          showModal: this.state.showModal,
          selectedUser: this.state.selectedUser
        });
      })
      .catch(err => {
        this.setState({
          users: this.state.users,
          error: err,
          showModal: this.state.showModal,
          selectedUser: this.state.selectedUser
        });
      });
  }

  componentDidMount() {
    this.getUsers();
  }

  render() {
    const modalInner = this.state.selectedUser ? (
      <div>
        <h1>User: {this.state.selectedUser.username}</h1>
        <h3>ID: {this.state.selectedUser.rowid}</h3>
        <h3>Email: {this.state.selectedUser.email}</h3>
        <button onClick={this.visitPage}>Go to User Page</button>
      </div>
    ) : null;

    if (!this.state.users) {
      return (
        <div className='user-list'>
          <h1>No users in database!</h1>
        </div>
      );
    }

    return (
      <div className='user-list'>
        <Modal
          show={this.state.showModal}
          onClose={this.toggleModal}
          style={{ width: '20%' }}
        >
          {modalInner}
        </Modal>
        <Table
          className='user-table'
          tHeadClass='users-head-row'
          tBodyClass='users-body'
          columns={['ID', 'Username', 'Email']}
        >
          {this.state.users.map((user, key) => {
            return (
              <TableRow
                rownum={key}
                key={key}
                data={user}
                className='users-row'
                click={this.rowClick}
              ></TableRow>
            );
          })}
        </Table>
      </div>
    );
  }
}

export default UserList;
