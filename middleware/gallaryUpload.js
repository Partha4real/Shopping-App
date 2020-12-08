const multer = require('multer')
const path = require('path');
const fs = require('fs-extra')

// multiple file upload
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const {title, category} = req.params;
      console.log(title, category)
      const gallery = `./public/uploads/${category}/${title}/gallery`;
      cb(null, gallery)
    },
    filename: function (req, file, cb) {
        let {category, title} = req.params;
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
const uploadGallary = multer({
    storage: storage,
    fileFilter: multerFilter
});



module.exports= {
    uploadGallary
}






