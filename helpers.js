//--------DATA-----------

const users = {
  "p7Wfcb": {
    id:       'p7Wfcb',
    email:    'edward@musicsmith.ca',
    password: '$2b$10$nIgyZ0xcIpqyh92vOsWblOJezAh37iipNr0eksoNrisD1uVezptLe'
  },
  "eviWVl": {
    id:       'eviWVl',
    email:    'al@al.com',
    password: '$2b$10$LXCrVcbWgsI0Q.DkROgYAO/r4lhqYxq3pOOBMSd7H3A4.a9MZrGme'
    
  }

};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "eviWVl" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "eviWVl" },
  "2fx9f3": { longURL: "http://www.musicsmith.ca", userID: "p7Wfcb" },
  "weBJvX": { longURL: "http://www.yahoo.ca", userID: "p7Wfcb"},
  "g@n0nD": { longURL: "http://www.zeldauniverse.net", userID: "p7Wfcb"}
};

//----------Helper Functions-----------

const bcrypt = require('bcrypt');

// returns id for a user who exists in system, null if user does not exist
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

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

// given a short url and user id, returns a boolean to indicate if user is allowed to access that URL's Edit page
function urlIsAllowed(shortURL, id) {
  const authorizedUrls = urlsForUser(id);
  for (const url of authorizedUrls) {
    if (shortURL === url.shortCut) {
      return true;
    }
  }
  return false;
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

module.exports = { getUserByEmail, generateRandomString, urlsForUser, passwordCorrect, emailExists, urlIsAllowed, users, urlDatabase }