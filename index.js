const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Jimp = require("jimp");

const app = express();

const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // giới hạn dung lượng file tải lên
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("file");

const uploads = multer({
  storage,
  limits: { fileSize: 1000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).array("files");

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
app.set("view engine", "ejs");
app.set("views", "./views");

// app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.render("index");
});

// Single
app.post("/upload", (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render("index", {
          msg: "Error: No File Selected!"
        });
      } else {
        res.render("index", {
          msg: "File Uploaded!",
          file: `<img src="uploads/${req.file.filename}"  class="responsive-img"/>`
        });
      }
    }
  });
});

//Multiple
app.post("/uploads", (req, res, next) => {
  uploads(req, res, err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {
      if (req.files == undefined) {
        res.render("index", {
          msg: "Error: No file selected"
        });
      } else {
        let fileInfo = req.files;
        let resultImg = fileInfo.map(
          img => `<img src="uploads/${img.filename}"  class="responsive-img"/>`
        );
        resultImg = resultImg.reduce((a, b) => a + b, "");
        res.render("index", { msg: "File Uploaded!", resultImg });
      }
    }
  });
});

app.get("/show-all", (req, res) => {
  let galleryImage = fs.readdirSync("./public/uploads", "utf-8");
  res.render("showall", { galleryImage });
});

app.post("/edit-img", async (req, res) => {
  let { name, w, h, nameImg } = req.body;
  w =parseInt(w)
  h = parseInt(h)
  let arrNameImg = nameImg.split(".");
  let currentImg = await Jimp.read(`public/uploads/${nameImg}`);
  await currentImg.resize(w, h);
  console.log(currentImg);
  await currentImg.writeAsync(
    `public/uploads/${arrNameImg[0]}_${w}x${h}.${arrNameImg[1]}`
  );
  res.send(req.body);
});

app.listen(PORT, () => console.log(`App running ${PORT}`));
