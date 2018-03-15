import * as ActionTypes from './userActionTypes';

export const refreshUser = () => {
  return {
    type: ActionTypes.REFRESH,
  };
};

export const requestUser = () => {
  return {
    type: ActionTypes.REQUEST,
  }
};

export const injectUser = (user = {}) => {
  return {
    type: ActionTypes.INJECT,
    payload: {
      user
    }
  };
};

export const logoutUser = () => {
  window.sessionStorage.removeItem('accessToken');

  return {
    type: ActionTypes.LOGOUT
  }
};

export const getUserProfile = accessToken => dispatch => {
  console.log('Fetching user profile');

  const url = 'https://api.github.com/user';
  const header = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `token ${accessToken}`,
    }
  };
  dispatch(requestUser());
  return fetch(url, header)
    .then(response => {
      if (response.ok) {
        response.json()
          .then(json => {
            console.log(json);
            dispatch(injectUser(json))
          });
      } else if (response.status === 401) {
        // Unauthorized. We need to restart the OAuth flow
        dispatch(refreshUser());
      } else {
        dispatch(logoutUser());
      }
    })
};

export const authoriseUser = (code, state) => dispatch => {
  const url = `https://vvz5p9ifq0.execute-api.us-east-1.amazonaws.com/dev/oauth/authenticate?code=${code}&state=${state}`;
  const header = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  dispatch(requestUser());
  return fetch(url, header)
    .then(response => {
      if (response.ok) {
        response.json().then(json => {
          const accessToken = json.token;
          sessionStorage.setItem('accessToken', accessToken);
          return dispatch(getUserProfile(json.token));
        })
      }
    })
};
