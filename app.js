const express = require('express')
const path = require("path");

const AWS = require("aws-sdk");

const app = express()

require('dotenv').config()


// #############################################################################
// Logs all request paths and method
app.use(function (req, res, next) {
  res.set('x-timestamp', Date.now())
  res.set('x-powered-by', 'cyclic.sh')
  console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.path}`);
  next();
});


app.get('/notify/:id/:data', async (req, res) => {
  var id = req.params.id;
  var data = req.params.data;
    
    var aa = {"data":data};
    console.log('toto');
    var  s3 = new AWS.S3()
    await s3.putObject({
      Body: JSON.stringify(aa),
      Bucket: process.env.BUCKET,
      Key: 'd_'+id,//+".txt",
    }).promise();

    res.send("OK");
})

app.get('/state', async (re, res) => {
  var  s3 = new AWS.S3()
      
  var params = {
    Bucket: process.env.BUCKET,
    Prefix: "d_"
  }; 
      
    s3.listObjects(params, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
        var toRet = [];

        for (var obj of data.Contents)
        {
          s3File = await s3.getObject({
            Bucket: process.env.BUCKET,
            Key: obj.Key,
          }).promise();

          toRet.push(
            {
              k: obj.Key,
              v: JSON.parse(s3File.Body.toString())
            }
          );
        }

        res.send(toRet);
    }
  });
});


app.get('/query', async (re, res) => {
  var now = Date.now();

  var  s3 = new AWS.S3()
      
  var params = {
    Bucket: process.env.BUCKET,
    Prefix: "d_"
  }; 
      
    s3.listObjects(params, async function (err, data) {
    if (err) {
        console.log(err);
    } else {
        var toRet = [];

        for (var obj of data.Contents)
        {
          s3File = await s3.getObject({
            Bucket: process.env.BUCKET,
            Key: obj.Key,
          }).promise();

          var val = JSON.parse(s3File.Body.toString());
          var data = parseInt(val.data) - now;
          data /= 1000;

          var avis = "nominal";
          if (data < -60*10) //more thatn 10 min
          {
            avis = "toolate";
          }

          toRet.push(
            {
              k: obj.Key,
              v: data,
              adv: avis
            }
          );
        }

        res.send(toRet);
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
