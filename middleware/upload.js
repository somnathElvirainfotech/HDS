var multer = require ('multer');
var path = require ('path');

const storage = multer.diskStorage ({
  destination: function (req, file, cb) {
    if (file) {
      if (file.fieldname == 'logo') {
        cb (null, 'public/uploads/logos');
      }
      if (file.fieldname == 'hero_image') {
        cb (null, 'public/uploads/logos');
      }
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now () + '-' + Math.round (Math.random () * 1e9);
    cb (null, 'image' + '-' + uniqueSuffix + path.extname (file.originalname));
  },
});

const upload = multer ({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match (/\.(jpg|jpeg|png)$/)) {
      return cb (undefined, false);
    }
    cb (undefined, true);
  },
});

module.exports = upload;
