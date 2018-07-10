'use strict';


module.exports = function(app) {
    var uploader = require('../controllers/uploaderControllers');
    //Post
    app.post('/api/upload',uploader.uploadFile);
    //Get
    app.get('/api/upload/:fileName',uploader.readFile);
    app.get('/api/upload/:fileName/:isDownload',uploader.readFile);
    //Delete
    app.delete('/api/upload/:fileName',uploader.removeFile);
};