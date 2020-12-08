const multer = require('multer')
const path = require('path');
const sharp = require("sharp");
const fs = require('fs-extra')
// const mkdirp = require('mkdirp');
// const resizing = require('resize-img')
// const fs = require('fs-extra');

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const {title, category} = req.body;
      const dir = `./public/uploads/${category}/${title}`;
      const gallery = `./public/uploads/${category}/${title}/gallery`;
      const thumbs = `./public/uploads/${category}/${title}/thumbs`;
      fs.mkdirSync(dir, { recursive: true }, error => cb(error, dir));
      fs.mkdirSync(gallery, { recursive: true }, error => cb(error, gallery));
      //fs.mkdirSync(thumbs, { recursive: true }, error => cb(error, thumbs));
      cb(null, dir)
    },
    filename: function (req, file, cb) {
        let {category, title} = req.body;
        cb(null, file.fieldname + '-' + category + '-' + title + '-' + Date.now() + path.extname(file.originalname));
    },   
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb("Please upload only images.", false);
    }
};
//init upload
const upload = multer({
    storage: storage,
    fileFilter: multerFilter
});

const resizeImages = async (req, res, next) => {
    if (!req.files) return next();
    console.log(req.files)
    req.body.images = [];
    await Promise.all(
      req.files.map(async file => {
        let {category, title} = req.body;
        const filename = file.fieldname + '-' + category + '-' + title + '-' + Date.now() + path.extname(file.originalname)
  
        await sharp(file.buffer)
          .resize(640, 320)
          .toFile(`public/upload/${filename}`);
  
        req.body.images.push(filename);
      })
    );
  
    next();
  };
  

module.exports= {
    upload,
    resizeImages
}






//set storage engine
// const storage = multer.diskStorage({
//     destination: './public/upload',
//     filename: function(req, file, cb){
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });


//check file type
// function checkFileType(req, file, cb) {
//     //extensions allowed
//     const fileTypes = /jpeg|jpg|png|gif/;
//     //check extension
//     const extensionName = fileTypes.test(path.extname(file.originalname).toLowerCase());
//     //check mime
//     const mimeType = fileTypes.test(file.mimetype)

//     if(mimeType && extensionName) {
//         return cb(null, true);
//     } else {
//         req.flash('error_msg', 'select image file only');
//         //return errors.push({msg: 'select image file only'})
//         return cb(errors.push({msg: 'select image file only'}));
//     }
// }