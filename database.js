var mysql = require('mysql');
var util = require('util');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nidev",
  multipleStatements: true
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

const query = util.promisify(con.query).bind(con);

module.exports = {con, query};