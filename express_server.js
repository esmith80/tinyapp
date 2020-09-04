// helper functions and database
const hp = require("./helpers");

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

//-----------MIDDLEWARE CONFIGURATION ---------

app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));

//--------- POST Request Handlers ---------

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.statusCode = 403;
    return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`);
  }
  if (!hp.emailExists(email)) {
    res.statusCode = 403;
    return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`);
  } else if (!hp.passwordCorrect(hp.getUserByEmail(email, hp.users).id, password)) {
    res.statusCode = 403;
    return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`);
  } else {
    req.session.user_id = hp.getUserByEmail(email, hp.users).id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id) { // is cookie the only check we need?
    res.statusCode = 401;
    res.send("You can't delete that. You're not logged in as the correct user.\n");
  } else {
    const shortURL = req.params.shortURL;
    delete hp.urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (!req.session.user_id) {
    res.statusCode = 401;
    res.send("You can't edit that. You're not logged in as the correct user.\n");
  } else {
    hp.urlDatabase[req.body.shortURL].longURL = req.body.newLongURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  }
});

app.post("/urls", (req, res) => {
  let shortURL = hp.generateRandomString();
  hp.urlDatabase[shortURL] = { "longURL": req.body.longURL, "userID": req.session.user_id }; // note this is not putting "" around keys
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  console.log(req.body.password);

  if (!email || !password) {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`);
  }
  if (hp.emailExists(email)) {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`);
  }
  const userID = hp.generateRandomString();
  const user = {
    id:       userID,
    email:    email,
    password: password
  };
  hp.users[userID] = user;
  req.session.user_id = userID;
  res.redirect("/urls");
});

// --------- GET Request Handlers ---------

app.get("/login", (req, res) => {
  const templateVars = {
    urls: hp.urlDatabase,
    user: hp.users[req.session.user_id]
  };
  res.render('login', templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: hp.urlDatabase,
    user: hp.users[req.session.user_id]
  };
  res.render('register', templateVars);
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(hp.urlDatabase);
});

app.get("/urls", (req, res) => {
  const user = hp.users[req.session.user_id];
  const templateVars = {
    urls: hp.urlsForUser(req.session.user_id),
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = {
    urls: hp.urlDatabase,
    user: hp.users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // feature request to fix their url to make sure it's http://
  const longURL = hp.urlDatabase[req.params.shortURL].longURL;
  res.redirect(`${longURL}`);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    longURL: hp.urlDatabase[req.params.id].longURL,
    shortURL: req.params.id,
    user: hp.users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

//--LISTEN--
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});