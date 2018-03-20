import * as ActionTypes from './userActionTypes';
import { decode }  from 'jsonwebtoken';
import { apiEndpoint } from '../config-dev';

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
  const jwtToken = sessionStorage.getItem('jwtToken');
  if (jwtToken) {
    window.sessionStorage.removeItem('jwtToken');

    const url = `${apiEndpoint}/logout`;
    const header = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    };
    fetch(url, header).then(() => {});
  }
  return {
    type: ActionTypes.LOGOUT
  }
};

export const authoriseUser = (code, state) => dispatch => {
  const url = `${apiEndpoint}/oauth/authenticate?code=${code}&state=${state}`;
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
          const jwtToken = json.token;
          const claims = decode(jwtToken);
          sessionStorage.setItem('jwtToken', jwtToken);
          return dispatch(injectUser(claims));
        })
      }
    })
};
