const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/images/');    // Ensure the 'images' folder exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });  // Create subfolders if not exist
    }
    cb(null, dir); // Store the files in the uploads/images folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext; // Use timestamp for a unique filename
    cb(null, filename); // Use timestamp-based filenames
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Filter to only allow .jpg, .jpeg, and .png files
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only .jpg, .jpeg, and .png files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
}).array('images', 3); // Limit to 3 files per upload

// Middleware to handle the image uploads
const uploadImages = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: err.message });
    }
    next(); // Continue to the next middleware or controller
  });
};

module.exports = { uploadImages };
