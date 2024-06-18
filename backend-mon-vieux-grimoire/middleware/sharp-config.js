const sharpMiddleware = require('sharp');
const fs = require('fs');

const resizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  const filePath = req.file.path;
  const resizedFilePath = filePath.replace('.', '-resized.');

  sharpMiddleware(filePath)
    .resize(500) // Resize to 500px width (adjust as needed)
    .toFile(resizedFilePath, (err, info) => {
      if (err) {
        return next(err);
      }
      req.file.resizedPath = resizedFilePath;
      next();
    });
};

module.exports = resizeImage;
