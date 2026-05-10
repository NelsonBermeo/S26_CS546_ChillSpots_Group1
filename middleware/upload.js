import multer from "multer";
const storage = multer.memoryStorage();
let allowedExtns = ["image/jpeg", "image/png", "image/webp"];

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!allowedExtns.includes(image.mimetype)) {
      return cb(new Error("Only PNG, JPEG, and WEBP images are allowed."));
    }
    cb(null, true);
  },
});
