const express = require('express')
const path = require("path");

const AWS = require("aws-sdk");
const s3 = new AWS.S3()
const bodyParser = require('body-parser');

const app = express()

// #############################################################################
// Logs all request paths and method
app.use(function (req, res, next) {
  res.set('x-timestamp', Date.now())
  res.set('x-powered-by', 'cyclic.sh')
  console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.path}`);
  next();
});

// #############################################################################
// This configures static hosting for files in /public that have the extensions
// listed in the array.
var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
  index: ['index.html'],
  maxAge: '1m',
  redirect: false
}
app.use(express.static('public', options))


app.get('/notify/:id', async (req, res) => {
    var to = req.params.id; // { userId: '42' }
    
  await s3.putObject({
    Body: JSON.stringify(
      {
        ts: Date.now()
      }
    ),
    Bucket: process.env.BUCKET,
    Key: 'd_'+id,

  }).promise()



  res.send('Hello World!' + to);
})

app.get('/state', async (re, res) => {

      
  var params = {
    Bucket: process.env.BUCKET,
    Prefix: "d_"
  }; 
      
    s3.listObjects(params, function (err, data) {
    if (err) {
        console.log(err);
    } else {
      
        res.send(data);
        console.log(data);
    }
  });

});

// #############################################################################
// Catch all handler for all other request.
app.use('*', (req,res) => {
  res.json({
      at: new Date().toISOString(),
      method: req.method,
      hostname: req.hostname,
      ip: req.ip,
      query: req.query,
      headers: req.headers,
      cookies: req.cookies,
      params: req.params
    })
    .end()
})

module.exports = app
