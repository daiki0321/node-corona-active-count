var mysql = require('mysql');

var dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'mhlw_stf'
};

var connection = mysql.createConnection(dbConfig);

exports.addData = function(data) {

  var query = 'INSERT INTO mhlw_data (created_date, Total_num, Numbyday) VALUES ("' + data.date + '", "' + data.num + '", "' + data.numByday+ '")';
  connection.query(query, function(err, rows) {
  });
}

exports.getData = function() {

  return new Promise(resolve => {

    var query = 'SELECT * FROM mhlw_data';
    connection.query(query, function(err, rows){
      console.log(rows);
      resolve(rows)
    });
  });
}