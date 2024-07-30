const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const quotes = require('./public/records/quotes.json'); 
const bestQuotesByLikes = quotes.sort((a, b) => b.likes - a.likes);
const topQuote = bestQuotesByLikes[0];

app.get('/', (req, res) => {
    const randQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.render('index', { topQuote: topQuote,  randQuote: randQuote });
});
app.post('/searchByTags', (req, res) => {
    console.log('Request method:', req.method);
    console.log('Request body:', req.body);
    const checkedValues = req.body.checkedValues;
    res.render('searchByTags', { checkedValues });
});


app.listen(1000, () => {
    console.log('server started: http://localhost:1000');
});
