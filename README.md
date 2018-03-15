## GitHub App example

This repository contains the modules needed to login to GitHub in order to authenticate a user, for instance, after installing a GitHub app. 

Most GitHub apps that can be installed through the marketplace, aren't in fact actual GitHub apps. That is, they don't show up in the list of (Authenticated) GitHub apps.

However, all GitHub apps install an OAuth component for authentication. That is what this example show. 

It contains two elements: client and server. The client is a React front-end that will show the OAuth flow. Upon clicking 'Login', the user will be redirected to GitHub to authorise the user. After authorisation, the user is redirected to the app and provided a `code`. 

The server is a specific service that contains the Client Secret for the app. It uses the `code` from the previous step together with the Client Id and Client Secret to retrieve an Access Token. This Access Token is then returned to the React app, which in turn retrieves a user object from GitHub using the Access Token. This apparently a necessary step because GitHub doesn't support the "implicit" OAuth flow.

The Access Token is stored in `sessionStorage`. This means that the page can be reloaded without losing the user authentication.

### Installation

```bash
$ cd client
$ npm i
$ npm start
```

This will spin up a local web server and open the page in a browser.

### Usage

Click on the 'Log in' button in the top right corner and follow the instructions to authorise the user. When authorisation succeeds, the app will then populate a user object by accessing the GitHub API using the Access Token. This may take a few seconds, during which time 'Loading...' is shown.
