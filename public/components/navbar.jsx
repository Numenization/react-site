import React from "react";
import { NavLink } from "react-router-dom";

class NavBar extends React.Component {
  render() {
    return (
      <div id="navbar">
        <ul>
          <img src={require("../images/1513576710170.png")}></img>
          <li>
            <NavLink exact to="/" activeClassName="active">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/users" activeClassName="active">
              Users
            </NavLink>
          </li>
          <li className="last">
            <NavLink to="/login" activeClassName="active">
              Register
            </NavLink>
          </li>
        </ul>
      </div>
    );
  }
}

export default NavBar;
