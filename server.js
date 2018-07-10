'use strict';
const express = require('express'),
      app = express(),
      port = 3000,
      bodyParser = require('body-parser'),
      fileUpload = require('express-fileupload');

//sử dụng middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());


//Router
var routes = require('./api/routes/uploaderRouters');
routes(app);

var server = app.listen(port,function(){
    var host = server.address().address,
        port = server.address().port;
    console.log("Đã khởi tạo Upload API tại port %s",port);
});