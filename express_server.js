const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

//--------DATA-----------

const users = {};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
  "2fx9f3": { longURL: "http://www.musicsmith.ca", userID: "user2RandomID" },
  "weBJvX": { longURL: "http://www.yahoo.ca", userID: "a"},
  "g@n0nD": { longURL: "http://www.zeldauniverse.net.", userID: "a"}
};

//----------Helper Functions-----------

// returns an array of objects (filtered urls the user is allowed to access; their ID is associated with the url record in the master

function urlsForUser(id) {
  let filteredUrls = [];
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      filteredUrls.push( {
        shortCut: url,
        longURL: urlDatabase[url].longURL,
      });
    }
  }
  return filteredUrls;
}

// generates a 6-character long string of numbers and letters
function generateRandomString() {
  randomString = "";
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}
// returns true if email exists in user database
function emailExists(email) {
  for (const userID in users) {
    if (users[userID].email === email) {
      return true;
    }
  }
  return false;
}

// returns true if email and password equal a single user's email and password properties
function passwordCorrect(userID, password) {
    if (bcrypt.compareSync(password, users[userID].password)) {
        return true;
      }
    return false;
  }

// returns id for a user who exists in system, null if user does not exist
function getUserID(email) {
  for (const userID in users) {
    if (users[userID].email === email) { 
        return userID;
      }
    }
  return null;
  }  
//-----------MIDDLEWARE CONFIGURATION ---------

app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//----------TEST CONSOLE LOGS--------
setInterval( () => {
  console.table(users);
}, 60000);


//--------- POST Request Handlers ---------

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
     res.statusCode = 403;
     return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`);
  }
  if (!emailExists(email)) {
    res.statusCode = 403;
    return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`); 
  } else if (!passwordCorrect(getUserID(email), password)) {
    res.statusCode = 403;
    return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`);
  } else {
    req.session.user_id = getUserID(email);

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
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }  
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (!req.session.user_id) { // is cookie the only check we need?
    res.statusCode = 401;
    res.send("You can't edit that. You're not logged in as the correct user.\n");
  } else {
    urlDatabase[req.body.shortURL].longURL = req.body.newLongURL;
    res.redirect(`/urls/${req.params.shortURL}`);
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { "longURL": req.body.longURL, "userID": req.session.user_id }; // note this is not putting "" around keys
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
  if (emailExists(email)) {
    res.statusCode = 400;
    return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`); 
  }
  const userID = generateRandomString();
  const user = {
    id:       userID,
    email:    email,
    password: password
  }
  users[userID] = user;
  req.session.user_id = userID;
  res.redirect("/urls");
});

// --------- GET Request Handlers ---------

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render('login', templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render('register', templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) { // should this be broken out to 'logginIn' function? what would i need to pass it?
    return res.redirect("/urls"); // this link shouldn't show if i'm not logged in
  }
  
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});
  // how does this get request happen? from the <a> in the site OR from ...where else?
  app.get("/u/:shortURL", (req, res) => {
    // if incoming url is not valid, respond with url you entered is not valid
    // this is where you can fix their url to make sure it's http://
    const templateVars = {
      urls: urlDatabase,
      user: users[req.session.user_id]
    };
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // put if statement to take off http:// or https://
  res.redirect(`${longURL}`);
});

// need to check that :id exists before the redirect
app.get("/urls/:id", (req, res) => { // can get Express routing syntax highlighter
  
  const templateVars = {
    longURL: urlDatabase[req.params.id].longURL,
    shortURL: req.params.id,
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//app.get("/u/:shortURL/:rohitid")
//1. we always use req.params if we are going to access the variable from the route
// it means that in the above example, I can access it with 
// req.params.shortURL
//req.params.rohitid

  //within this route only
  // req.params
  // let temp = {id: req.params.shortURL};
  // res.render("rohit_view",temp);