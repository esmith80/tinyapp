const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  randomString = "";
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params);
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
}); 

app.post("/urls", (req, res) => {  
  let { longURL } = req.body;
  let shortURL = generateRandomString();                   
  urlDatabase[shortURL] = longURL; // note this is not putting "" around keys
  res.redirect(302, `/urls/${shortURL}`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(302, `${longURL}`);
});  


app.get("/urls/:id", (req, res) => { // can get Express routing syntax highlighter
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
};
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});