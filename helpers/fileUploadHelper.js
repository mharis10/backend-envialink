const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/images/');    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });  
    }
    cb(null, dir); 
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext; 
    cb(null, filename); 
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).array('images', 3); 


const uploadImages = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }
    next(); 
  });
};

module.exports = { uploadImages };
