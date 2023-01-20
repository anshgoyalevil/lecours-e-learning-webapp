const express = require('express');
const router = express.Router();
const multer = require('multer');
const deepai = require('deepai');
const fs = require('fs');
const _ = require("lodash");
const path = require("path");

//Setting DeepAI.org API Key for Deep Learning API
deepai.setApiKey(process.env.API_KEY);

//Get request for "/image-processor" route
router.get("/image-processor", function (req, res) {
    //Render "imageprocessor" page
    res.render("imageprocessor");
});

//Get request for "/processedResult" route
router.get("/processedResult", function (req, res) {
    //Render "processedResult" page and pass the score variable
    res.render("processedResult", {
        score: score,
    });
});

var files = [];
var i = 0;
var score = -1;

//Multer (Uploading Images to Disk)
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //Path where the files would be uploaded
        cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        //Modify the name of the uploaded file
        cb(null, file.fieldname + "." + _.lowerCase(path.extname((file.originalname))));
    }
});

var upload = multer({ storage: storage });
var multipleUpload = upload.fields([{ name: 'file1', maxCount: 1 }, { name: 'file2', maxCount: 1 }]);

//Post reqest for "/upload" route
router.post("/upload", multipleUpload, function (req, res) {
    if (req.files) {
        console.log("file uploaded successfully");
        const testFolder = 'public/uploads';
        //Read uploaded files from the server
        fs.readdirSync(testFolder).forEach(file => {
            files[i] = file;
            i++;
        });
        //DeepAI.org Image Similarity Async API Call
        (async function () {
            var resp = await deepai.callStandardApi("image-similarity", {
                image1: fs.createReadStream("public/uploads/" + files[0]),
                image2: fs.createReadStream("public/uploads/" + files[1]),
            });
            score = resp.output.distance;
            //Redirect to "/processedResult" page after the API call return a response
            res.redirect("/processedResult");
        })()
    }
});


module.exports = router;