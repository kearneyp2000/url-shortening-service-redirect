const express = require("express");
const bodyParser = require("body-parser");
const validUrl = require('valid-url');
const shortid = require('shortid');
const config = require('config');
var AWS = require("aws-sdk");
const queryTable = require(__dirname + "/queryTable.js");
const dbTable = "url-mappings";
const client = "ba";

const app = express();
const PORT = 4001;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json({ extended: false }));

app.get("/", (req,res) => {
    res.send("<h1>Redirect Service Is Running</h1>")
});

app.get('/:code', async (req, res) => {
  try {
    
    console.log("req.params.code : " + req.params.code);
    console.log("req.params : " + JSON.stringify(req.params, null, 2));

    var params = {
      TableName: dbTable,
      KeyConditionExpression: "#r_source = :resource",
      ExpressionAttributeNames: {
        "#r_source": "resource",
      },
      ExpressionAttributeValues: {
        ":resource": req.params.code
      }
    };
  
    queryTable.queryTable(params)
    .then(response => {
      console.log("response : " + JSON.stringify(response, null, 2));
      console.log(response.Count);
        if (response.Count > 0) { 
          console.log("response.Count : " + response.Count);
          return res.redirect(response.Items[0].longurl);
        } else {
            //if the shorturl or code does not exist
            return res.status(404).json('The url was not found!');
        }
      })
      .catch(err => {
        console.log("error : " + err)
      });

  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

app.listen(PORT, () => console.log("server started on http://localhost:" + PORT));