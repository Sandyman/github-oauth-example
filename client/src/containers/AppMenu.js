import React, { Component } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { toQuery, } from '../util/utils';
import createState from '../util/state';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';

import popupWindow from '../util/openWindow';
import * as userActions from '../actions/userActions';

const getWindowOptions = () => {
  const windowArea = {
    width: Math.max(Math.floor(window.outerWidth * 0.6), 1000),
    height: Math.max(Math.floor(window.outerHeight * 0.9), 630),
  };
  windowArea.left = Math.floor(window.screenX + ((window.outerWidth - windowArea.width) / 2));
  windowArea.top = Math.floor(window.screenY + ((window.outerHeight - windowArea.height) / 8));

  return {
    toolbar: 0,
    scrollbars: 1,
    status: 1,
    resizable: 1,
    location: 1,
    menuBar: 0,
    width: windowArea.width,
    height: windowArea.height,
    left: windowArea.left,
    top: windowArea.top,
  }
};

class AppMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeItem: 'home'
    };
  }

  componentDidMount() {
    let accessToken;
    if (sessionStorage) {
      accessToken = sessionStorage.getItem('accessToken');
    }
    if (accessToken) {
      this.props.userActions.getUserProfile(accessToken);
    }
  }

  handleLogin() {
    const state = createState();
    const search = toQuery({
      client_id: '09a642882b932f7911bc',
      scope: 'user',
      state: state,
      redirect_uri: 'http://localhost:3000/oauth/callback',
    });
    const popup = popupWindow.open(
      state,
      `https://github.com/login/oauth/authorize?${search}`,
      getWindowOptions(),
    );
    popup
      .then(response => {
        const { code, state } = response;
        this.props.userActions.authoriseUser(code, state);
      })
      .catch(console.log);
  }

  handleLogout() {
    this.props.userActions.logoutUser();
  }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { isAuthenticated, isInvalidated, isLoading, currentUser } = this.props;
    const { activeItem } = this.state;

    if (isInvalidated) {
      this.handleLogin();
    }

    const trigger = (
      <span>
        <Icon name='user' />
        {isAuthenticated ? currentUser.login : ''}
      </span>);

    const loginButton = isAuthenticated ?
      <Menu.Item>
        <Dropdown simple trigger={trigger}>
          <Dropdown.Menu>
            <Dropdown.Item>Account</Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={this.handleLogout.bind(this)}>Log out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Item>
      : isLoading ?
        <Menu.Item>Loading...</Menu.Item>
        :
        <Menu.Item onClick={this.handleLogin.bind(this)}>Log in</Menu.Item>;

    return (
      <Menu size="large" pointing>
        <Menu.Item header>Domain Tracker</Menu.Item>
        <Menu.Item name="home" active={activeItem === 'home'} onClick={this.handleItemClick} />
        <Menu.Menu position='right'>
          {loginButton}
        </Menu.Menu>
      </Menu>
    )
  }
}

AppMenu.propTypes = {
  isAuthenticated: propTypes.bool,
  isInvalidated: propTypes.bool,
  isLoading: propTypes.bool,
  currentUser: propTypes.object
};

const mapStateToProps = state => {
  const { user } = state;
  return {
    isLoading: user.isLoading,
    isInvalidated: user.isInvalidated,
    isAuthenticated: user.isAuthenticated,
    currentUser: user.user
  }
};

const mapDispatchToProps = dispatch => ({
  userActions: bindActionCreators(userActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AppMenu);
