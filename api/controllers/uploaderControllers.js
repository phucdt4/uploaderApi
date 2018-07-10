'use strict';

const directory = "uploads/";
const fs = require('fs');
const path = require('path');
const isBinaryFile = require("isbinaryfile");
//Upload a new file
exports.uploadFile = function(req,res){
    console.log();
    //Check input
    if (!req.files){
        return res.send ({
            status: "400",
            message: "No files were uploaded.",
            response: "fail"
        });
    }
    let file = req.files[Object.keys(req.files)[0]]; //get only the first file
    let url = directory + file.name;
    //check duplication
    checkContent(directory,file, function(readStat,similar){
        if (!readStat){
            return res.send ({
                status: "400",
                message: "processing failed!",
                response: "fail"
            });
        }
        if (similar != undefined && similar != ""){
            return res.send ({
                status: "400",
                message: 'Simililar to ' + similar,
                response: "fail"
            });
        }
        // Use the mv() method to place the file somewhere on your server
        file.mv(url, function(err) {
            if (err){
                return res.send ({
                    status: "500",
                    message: err,
                    response: "fail"
                });
            }
            return res.send ({
                status: "200",
                message: "File uploaded!",
                response: "success"
            });
        });
    });
    
};

//Retrive an uploaded file by name
exports.readFile = function(req,res){
    //check input filename
    if (!req.params.fileName){
        return res.send ({
            status: "400",
            message: "No files were uploaded.",
            response: "fail"
        });
    }
    let url = directory + req.params.fileName;
    //check file exist
    if (!checkExist(url))
    {
        return res.send ({
            status: "400",
            message: "File does not exist.",
            response: "fail"
        });
    }

    //is Download or not
    if (req.params.isDownload && req.params.isDownload == "download"){
        res.download(url);
    }
    else{
        //is binary or not
        isBinaryFile(url, function (err, result) {
            if (!err) {
                //initialize a stream
                let stream = fs.createReadStream(url);
                
                //It is a binary file ==> Binary string
                if (result) {
                    let data = "";
                    stream.setEncoding('binary');
                    stream.once('error', function(err) {
                        return res.send ({
                            status: "500",
                            message: 'Not Found',
                            response: "fail"
                        });
                    });
                    stream.on('data', function(chunk){
                        data += chunk;
                    });
                    stream.on('end', function() {
                        return res.send ({
                            status: "200",
                            data: data,
                            response: "success"
                        });
                    });
                }
                else { // Text file => UTF8 String
                    let chunks = [];
                    stream.on("data", function (chunk) {
                        chunks.push(chunk);
                    });

                    stream.on("end", function () {
                        var data = Buffer.concat(chunks);
                        return res.send ({
                            status: "200",
                            data: data.toString(),
                            response: "success"
                        });
                    });

                    stream.on('error', function(error) {
                        return res.send ({
                            status: "500",
                            message: 'Not Found',
                            response: "fail"
                        });
                    });
                }
            }
        });
    }
   
};

var checkExist = function(path){
    return fs.existsSync(path);
};

//Remove a file by name
exports.removeFile = function(req,res){
    //check input filename
    if (!req.params.fileName){
        return res.send ({
            status: "400",
            message: 'No files were uploaded.',
            response: "fail"
        });
    }
    let url = directory + req.params.fileName;

    //check file exist
    if (!checkExist(url))
    {
        return res.send ({
            status: "400",
            message: "File does not exist.",
            response: "fail"
        });
    }
    fs.unlink(url, function(err) {
        if (err){
            return res.send ({
                status: "500",
                message: err,
                response: "fail"
            });
        }
        return res.send ({
          status: "200",
          response: "success"
        });     
    });

};

//Check duplicate content
var checkContent = function(dir,src,callback){
    var EventEmitter=require('events').EventEmitter,
    filesEE=new EventEmitter();

    var sameFile = "";

    // this event will be called when all files have been added to myfiles
    filesEE.on('files_ready',function(){
        callback(true,sameFile);
    });

    // Loop through all the files in the temp directory
    fs.readdir(dir , function( err, files) {
        if( err ) {
            console.error( "Could not list the directory.", err );
            callback(false,"");
        } 
        files.forEach( function( file, index ) {
            if (sameFile == ""){
                var fullPath = path.resolve(dir, file);
                var stat = fs.statSync(fullPath);

                if (stat && !stat.isDirectory()) {
                    if (stat.size == src.data.length)
                    {
                        var data = fs.readFileSync(fullPath);
                        if (err) {
                            console.error(err);
                            callback(false,"");
                        }
                        var content = data;
                        
                        if (content.toString() == src.data.toString()){
                            sameFile = file;
                        } 
                    }
                }
            }      
        });
        filesEE.emit('files_ready');
    });
    
};