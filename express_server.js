const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

//--------DATA-----------

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//----------Helper Functions-----------

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

//-----------MIDDLEWARE CONFIGURATION ---------

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//--------- POST Request Handlers ---------

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => { // can get Express routing syntax highlighter
  urlDatabase[req.body.shortURL] = req.body.newLongURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post("/urls", (req, res) => {  
  let { longURL } = req.body;
  let shortURL = generateRandomString();                   
  urlDatabase[shortURL] = longURL; // note this is not putting "" around keys
  res.redirect(`/urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
     res.statusCode = 400;
     return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`);
  }
  if (emailExists(email)) {
     return res.send(`${res.statusCode}: Bad Request (i.e. your fault) - There was a problem with your email or password`); 
    }

  const userID = generateRandomString();
  const user = {
    id:       userID,
    email:    email,
    password: password
  }
  users[userID] = user;
  res.cookie('user_id', userID);
  res.redirect("/urls");
});

// --------- GET Request Handlers ---------

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
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
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

  app.get("/u/:shortURL", (req, res) => {
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies.user_id]
    };
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(`${longURL}`);
});  


app.get("/urls/:id", (req, res) => { // can get Express routing syntax highlighter
  const templateVars = {
    longURL: urlDatabase[req.params.id],
    shortURL: req.params.id,
    user: users[req.cookies.user_id]
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