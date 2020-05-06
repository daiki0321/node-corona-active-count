var express = require('express');
var ejs = require("ejs");
var app = express();

const dataManager = require('./datamanager.js');

app.engine('ejs', ejs.renderFile);

// Google Chart API へ引き渡すデータ
app.get('/', (req,res,next) => {
    console.log(dataManager.getResultsData());

    let data = {
      items: dataManager.getResultsData()
    };
    return res.render("./charts.ejs", data);
  })

var server = app.listen(1234, function() {
    console.log('サーバを起動しました');
});
