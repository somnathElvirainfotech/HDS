var compression = require ('compression');
const express = require ('express');
const bodyParser = require ('body-parser');
const path = require ('path');
const mysql = require ('mysql');
const cookieParser = require ('cookie-parser');
const {check, validationResult} = require ('express-validator');
const nodemailer = require ('nodemailer');
var handlebar = require ('nodemailer-express-handlebars'); // email template
var cookieSession = require ('cookie-session');
var cors = require ('cors');
const app = express ();
var http = require ('http').Server (app);
const dotenv = require ('dotenv');

//// cors setup ///
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
};
app.use (cors (corsOptions));
//// cors setup ///

dotenv.config ();
app.use (compression ());
app.use (bodyParser.urlencoded ({extended: true}));
app.use (bodyParser.json ());
app.use (cookieParser ());

app.use ('/app-property', express.static (path.join (__dirname, 'public')));

///// multer midleware   ///////
const upload = require ('./middleware/upload');
var imgOptions = [{name: 'logo', maxCount: 1},{name:"hero_image",maxCount:1}];
/////  multer midleware  ///////

// API Routes
const {create} = require ('./api/index');

/////  wellcome page ////
app.get ('/', (req, res) => {
  res.send (`<center>
    <h3>Welcome to Dynamically create Google and Apple wallet digital loyalty cards with QR </h3>
    </center> `);
});


/////////// API Start ///////////
app.post (
  '/api/create',
  upload.fields (imgOptions),
  [
    check ('name').not ().isEmpty ().withMessage ('Name should not be blank'),
    check ('email')
      .not ()
      .isEmpty ()
      .withMessage ('Email should not be blank')
      .isEmail ()
      .withMessage ('Enter valid Email Id'),
    check ('text').not ().isEmpty ().withMessage ('Text should not be blank'),
    check ('url')
      .not ()
      .isEmpty ()
      .withMessage ('Url should not be blank')
      .isURL ()
      .withMessage ('Enter valid url'),
    check ('bg_color')
      .not ()
      .isEmpty ()
      .withMessage ('Background color should not be blank'),
  ],
  create
);

app.get ('/api/create', (req, res) => {
  res.json ({status: 'ok', msg: 'ok'});
});

// Database Connection ////

var dbcon = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'send_card',
  multipleStatements: true,
});

// var dbcon = mysql.createConnection({
//     host: 'localhost',
//     user: 'eiplorg_send_cards',
//     password: 'XbnY7jW5h*&@',
//     database: 'eiplorg_send_cards',
//     multipleStatements: true
// });

dbcon.connect (err => {
  if (!err) {
    console.log ('Database Connection Established');
  } else {
    console.log (
      'Database Connection faild ' + JSON.stringify (err, undefined, 2)
    );
  }
});

// Database Connection ////

///// Email Configuration Start /////

// var transporter = nodemailer.createTransport ({
//   service: 'gmail',
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: 'noreplyhotspotdatingnow@gmail.com',
//     pass: 'P@ssword77',
//   },
// });

// var transporter = nodemailer.createTransport({
//     service: "smtp.gmail.com",
//     host: "mail.elvirainfotech.org",
//     port: 465,
//     secure: true,
//     auth: {
//         user: "noreply@elvirainfotech.org",
//         pass: "Seb4YCTQc9w5",
//     },
// });

var transporter = nodemailer.createTransport ({
  service: 'gmail',
  auth: {
    user: 'somnath.elvirainfotech@gmail.com',
    pass: 'jklollbascvqsykv',
  },
});

const handlebarOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: path.join (__dirname, 'EmailTemplates'),
    defaultLayout: false,
  },
  viewPath: path.join (__dirname, 'EmailTemplates'),
  extName: '.hbs',
};

transporter.use ('compile', handlebar (handlebarOptions));

///// Email Configuration End /////

const hostname = '127.0.0.1';
const port = 4101;
http.listen (port, hostname, () => {
  console.log (`Server running on port: http://${hostname}:${port}`);
});

module.exports.db = dbcon;
module.exports.mailConnection = transporter;
