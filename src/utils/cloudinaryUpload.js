const cloudinary = require("../config/cloudinary.config");
const streamifier = require("streamifier");

function cloudinaryUpload(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream((error, result) => {
      if (result) resolve(result);
      else reject(error);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

module.exports = cloudinaryUpload;
