var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'qlik'
});

connection.connect();

/*
Purpose: Returns a list of message objects from the backend database in JSON notation.
Input: Response object (res).
Output: List of JSON objects containing messages from the database.
 */
var listMessages = function(res){
  var messages = [];
  connection.query('SELECT * from messages', function(err, rows, fields) {
    if (err) throw err;
    for (var i = 0; i < rows.length; i++){
      console.log(rows[i].message);
      messages.push({messageID: rows[i].messageID, message: rows[i].message});
    }
    res.send(messages);
  });
}

/* GET: Retrieve all messages */
router.get('/', function(req, res) {
  listMessages(res);
});

/* POST: Check message contents, and:
 *  - Post message if "message" in request
  * - Palindrome check if "palindrome" in request, and
  * - Delete message if "delete" in request */
router.post('/', function(req, res) {
  var messagePost = req.body;
  console.log(messagePost);
  if ('message' in messagePost){
    connection.query('INSERT INTO messages SET ?', messagePost, function(err, rows, fields) {
      if (err) throw err;
      res.send("Message received\n");
    });
  }
  else if('palindrome' in messagePost){
    connection.query('SELECT * from `messages` WHERE `messageID` = ?', messagePost['palindrome'],
        function(err, rows, fields) {
      if (err) throw err;
      if (rows.length == 0) {
        res.send("Error: Message not found.\n");
      }
      else{
        var isPalindrome = "False";
        if(rows[0].message == rows[0].message.split("").reverse().join("")){
          isPalindrome = "True";
        }
        res.send("Message: " + rows[0].message + "\nPalindrome: " + isPalindrome + "\n")
      }
    });
  }
  else if('delete' in messagePost){
    connection.query('DELETE from `messages` WHERE `messageID` = ?', messagePost['delete'],
        function(err, rows, fields) {
      if (err) throw err;
      res.send("Message deleted.\n");
    });

  }
  else{
    /* Unknown request, just revert to listing messages */
    listMessages(res);
  }
});

module.exports = router;
