import React from "react";
import { Table, TableRow } from "./table";

class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = { users: null, error: null };

    this.rowClick = this.rowClick.bind(this);
  }

  rowClick(e) {
    console.log(e.target.parentNode);
  }

  componentDidMount() {
    fetch("/api/users/all/", {
      method: "get",
      headers: { "Content-Type": "application/json" }
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
          users: body,
          error: this.state.error
        });
      })
      .catch(err => {
        this.setState({
          users: this.state.users,
          error: err
        });
      });
  }

  render() {
    if (this.state.users) {
      return (
        <div className="user-list">
          <Table
            className="user-table"
            tHeadClass="users-head-row"
            tBodyClass="users-body"
            columns={["ID", "Username", "Email"]}
          >
            {this.state.users.map((user, key) => {
              return (
                <TableRow
                  rownum={key}
                  key={key}
                  data={user}
                  className="users-row"
                  click={this.rowClick}
                ></TableRow>
              );
            })}
          </Table>
        </div>
      );
    } else {
      return <h3>Loading...</h3>;
    }
  }
}

export default UserList;
