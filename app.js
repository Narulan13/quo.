const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  })
);

let quotes = [];
let topQuote = null;

function UPDquotes() {
  fs.readFile(
    path.resolve(__dirname, "./public/records/quotes.json"),
    "utf-8",
    (err, data) => {
      if (err) {
        console.error("Error reading quotes file:", err);
        return;
      }
      try {
        quotes = JSON.parse(data);
        getTopQuote();
      } catch (parseErr) {
        console.error("Error parsing quotes file:", parseErr);
      }
    }
  );
}

function checkEmptyList(){
  if (quotes.length === 0) {
    console.log("Quotes list is empty");
    return true;
  }
  return false;
}

function getTopQuote() {
  const today = new Date().toDateString().slice(4);
  const quotesForToday = quotes.filter((quote) => {
    const quoteDate = new Date(quote.date).toDateString().slice(4);
    return quoteDate === today;
  });

  if (quotesForToday.length === 0 || checkEmptyList()) {
    console.log("No quotes for today");
    topQuote = null;
    return;
  }

  topQuote = quotesForToday.reduce(
    (max, quote) => (quote.likes > max.likes ? quote : max),
    quotesForToday[0]
  );
}

fs.watchFile(
  path.resolve(__dirname, "./public/records/quotes.json"),
  (curr, prev) => {
    if (curr.mtime !== prev.mtime) {
      console.log("Quotes file changed, updating data...");
      UPDquotes();
    }
  }
);

UPDquotes();

app.get("/", (req, res) => {
  const isEmptyList = checkEmptyList();
  const randQuote = isEmptyList ? null : quotes[Math.floor(Math.random() * quotes.length)];
  res.render("index", {
    topQuote: isEmptyList ? null : topQuote,
    randQuote: randQuote,
    likedQuotes: req.session.likedQuotes || [],
    isEmptyList: isEmptyList
  });
});

app.post("/quote/:id", (req, res) => {
  const id = req.params.id;
  const quote = quotes.find((q) => q.id === id);
  if (!quote || checkEmptyList()) {
    return res.status(404).json({ success: false, message: "Quote not found" });
  }
  res.json({ success: true, quote: quote });
});

app.get("/quote/:id", (req, res) => {
  const id = req.params.id;
  const quote = quotes.find((q) => q.id === id);
  if (!quote || checkEmptyList()) {
    return res.status(404).render("404");
  }
  const data = {
    quote: quote,
    likedQuotes: req.session.likedQuotes || [],
  };
  res.render("quote", data);
});

app.post("/searchByTags", (req, res) => {
  let allTags = [
    null,
    "Humor",
    "Philosophy",
    "Science",
    "Literature",
    "Education",
    "Motivation",
    "Politics",
    "History",
    "Art",
    "Religion",
    "Love_and_attitude",
    "Wisdom",
    "Psychology",
    "Technology",
    "Health_and_well-being",
  ];
  console.log("Request method:", req.method);
  console.log("Request body:", req.body);

  var checkedValues = req.body.checkedValues;
  var checkedValuesIsEmpty = false;

  if (!checkedValues) {
    checkedValues = [];
  }
  if (!Array.isArray(checkedValues)) {
    checkedValues = [checkedValues];
  }
  if (checkedValues.length === 0) {
    checkedValues.push("No tags selected");
    checkedValuesIsEmpty = true;
  }

  let listQuotesByTags = quotes.filter((quote) =>
    quote.tags.some((tag) => checkedValues.includes(tag))
  );
  let listEmpty = null;
  if (!checkedValuesIsEmpty && listQuotesByTags.length === 0) {
    listEmpty = "No quotes found with the selected tags";
  } else if (listQuotesByTags.length === 0 && checkedValuesIsEmpty) {
    listQuotesByTags = quotes.filter((quote) =>
      quote.tags.some((tag) => allTags.includes(tag))
    );
  }
  console.log(listQuotesByTags);
  console.log(checkedValuesIsEmpty);
  const data = {
    checkedValues: checkedValues,
    listQuotesByTags: listQuotesByTags,
    listEmpty: listEmpty,
    likedQuotes: req.session.likedQuotes || [],
  };

  res.render("searchByTags", data);
});

app.post("/like/:id", (req, res) => {
  const id = req.params.id;
  const action = req.body.action;

  if (!req.session.likedQuotes) {
    req.session.likedQuotes = [];
  }

  const quote = quotes.find((q) => q.id === id);
  if (!quote) {
    return res.status(404).json({ success: false, message: "Quote not found" });
  }

  if (action === "like" && !req.session.likedQuotes.includes(id)) {
    quote.likes = parseInt(quote.likes, 10) + 1;
    req.session.likedQuotes.push(id);
  } else if (action === "unlike" && req.session.likedQuotes.includes(id)) {
    quote.likes = parseInt(quote.likes, 10) - 1;
    req.session.likedQuotes = req.session.likedQuotes.filter(
      (quoteId) => quoteId !== id
    );
  } else {
    return res.status(200).json({ success: true, likes: quote.likes });
  }

  fs.writeFile(
    path.resolve(__dirname, "./public/records/quotes.json"),
    JSON.stringify(quotes, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing quotes file:", err);
        return res.status(500).json({ success: false });
      } else {
        UPDquotes();
        return res.json({ success: true, likes: quote.likes });
      }
    }
  );
});

app.get("/addAQuote", (req, res) => {
  res.render("addAQuote");
});

app.post("/addAQuote", (req, res) => {
  let tags = req.body.AddcheckedValues;
  if (!tags) {
    tags = [null];
  }
  if (!Array.isArray(tags)) {
    tags = [tags];
  }
  const newQuote = {
    id: String(quotes.length + 1),
    quote: req.body.quote,
    author: req.body.author,
    likes: 0,
    tags: tags,
    date: new Date().toISOString(),
  };
  quotes.push(newQuote);
  fs.writeFile(
    path.resolve(__dirname, "./public/records/quotes.json"),
    JSON.stringify(quotes, null, 2),
    (err) => {
      if (err) {
        console.error("Error writing quotes file:", err);
        return res.status(500).json({ success: false });
      }
      res.redirect("/");
    }
  );
  console.log(quotes.length);
});

app.listen(3000, () => {
  console.log("Server started: http://localhost:3000");
});