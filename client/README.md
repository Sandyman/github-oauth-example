## GitHub App Example

Example React application that allows logging in via GitHub using OAuth2. 

First install all dependencies and create the `semantic-ui` files: 

```
$ cd client
$ npm i
$ cd src/semantic
$ gulp build
$ cd ../../
```

Now start the React app:

```
$ npm start
```

This will open a window in the browser pointing to `localhost:3000`. Click the `Login` button to redirect to GitHub. Authorise the app, and you will be redirected. 

After a short while, the Login button will have changed to show the login name of the user who authorised. 
