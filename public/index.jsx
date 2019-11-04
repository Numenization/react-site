import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavBar from './components/navbar';
import UserList from './components/userlist';
import LoginPage from './components/loginpage';
import UserPage from './components/userpage';
import './css/styles.css';

class App extends React.Component {
  render() {
    return (
      <Router>
        <div className='container'>
          <NavBar />
          <div id='content-container'>
            <Switch>
              <Route path='/users'>
                <UserList />
              </Route>

              <Route path='/user' component={UserPage} />

              <Route path='/login'>
                <LoginPage />
              </Route>

              <Route path='/'>
                <h1>Hello World!</h1>
              </Route>
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
