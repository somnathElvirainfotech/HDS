const dbcon = require ('../server');
const transporter = require ('../server');
const base64 = require ('base-64');
const md5 = require ('md5');
const Jimp = require ('jimp');
const JsBarcode = require ('jsbarcode');
const QRCode = require ('qrcode');
const fs = require ('fs');
const path = require ('path');
// const {createCanvas} = require ('canvas');   /// when it use this package install ///
const mysql = require ('mysql');
const {check, validationResult} = require ('express-validator');

module.exports = {
  create: async (req, res) => {
    // console.log(process.env.image_url);
    const errors = validationResult (req);
    const formData = req.body;
    if (!errors.isEmpty ()) {
      res.json ({status: 'error', message: errors.mapped ()});
    } else {
      if (req.files.logo !== undefined && req.files.hero_image !== undefined) {
        var image_name = req.files.logo[0].filename;
        var hero_image=req.files.hero_image[0].filename;
        await resize (
          'public/uploads/logos/' + image_name,
          'public/uploads/logos/resize/' + image_name
        );

        await resize2 (
          'public/uploads/logos/' + hero_image,
          'public/uploads/logos/resize/' + hero_image
        );

        ///// barcode genarate ////
        //  var canvas = createCanvas ();
        //  JsBarcode (canvas, formData.url,{
        //     width:1,
        //     height:50,
        //     format:"CODE128",
        //     displayValue:true,
        //     valid:()=>console.log("oj")
        //  });
        //  const buffer = canvas.toBuffer ('image/png');
        //  var barcode=`${Date.now()}-barcode.png`;
        //  fs.writeFileSync (`public/barcodes/${barcode}`, buffer);
        ///// barcode genarate ////

        //// qr code genarate ////
        var qrcode = `${Date.now ()}-qrcode.png`;
        await QRCode.toFile (`public/qrcodes/${qrcode}`, formData.url,{
          width: 353,
          height: 350,
          correctLevel:"H"
      });
         

        //// qr code generate  ////

        //// new code ctreate ///////
        const code = makeid (22);

        // console.log(image_name," object ",code);

        var sql = `INSERT INTO card SET 
                name=${mysql.escape (formData.name)},
                email=${mysql.escape (formData.email)},
                text=${mysql.escape (formData.text)},
                bg_color=${mysql.escape (formData.bg_color)},
                url=${mysql.escape (formData.url)},
                code=${mysql.escape (code)},
                logo=${mysql.escape (image_name)},
                hero_image=${mysql.escape(hero_image)},
                qrcode=${mysql.escape (qrcode)},
                created_at=NOW()
            `;

        await new Promise ((resolve, reject) => {
          dbcon.db.query (sql, (error, result) => {
            if (error) throw error;
            resolve ();
          });
        });

        /////  email send /////

        var mailOptions = {
          from: 'somnath.elvirainfotech@gmail.com',
          to: 'somnath91997@gmail.com',
          subject: 'Google and Apple wallet digital loyalty cards with QR',
          template: 'final',
          context: {
            name: formData.name,
            text: formData.text,
            bg_color: formData.bg_color,
            icon:`${process.env.image_url}/images/logo-top.jpg`,   ///  static image ///
            // logo: process.env.image_url + '/uploads/logos/resize/' + image_name,
            logo: `${process.env.image_url}/images/center-logo.jpg`,
            // hero_image: process.env.image_url + '/uploads/logos/resize/' + hero_image,
            hero_image:`${process.env.image_url}/images/lower-image.jpg`,
            // qrcode: process.env.image_url + '/uploads/qrcodes/' + qrcode,
            qrcode: `${process.env.image_url}/images/1672655085339-qrcode.png`,
          },
          // html: `<!doctype html>
          // <html lang="en">
          //   <head>
          //     <!-- Required meta tags -->
          //     <meta charset="utf-8">
          //     <meta name="viewport" content="width=device-width, initial-scale=1">
          
          //     <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
          
          //     <title>Hello, world!</title>
          //   </head>
          //   <body style="margin: 0; padding: 0; box-sizing: border-box; max-width: 768px; margin: 0 auto;">
               
          //     <div style="background: ${formData.bg_color}; padding: 10px 0px 0px 0px; border-radius: 30px; overflow: hidden;">
          //     <table style="width: 100%;">
          //         <tbody>
          //         <tr>
          //             <td style=" padding: 0 15px;"><img style="max-width: 100%;" src="${process.env.image_url}/logo-top.jpg" alt=""/></td>
          //         </tr>
          
          //         <tr style="text-align: center;">
          //             <td><img style="max-width: 100%;" src="${process.env.image_url}/center-logo.jpg" alt=""/></td>
          //         </tr>
          
          //         <tr>
          //             <td style="text-align: center;">
          //                 <h4 style="font-size: 35px; font-weight: 600; color: #FFF; margin: 20px 0; font-family: 'Poppins', sans-serif;"> ${formData.name} </h4> 
          //             </td>
          //         </tr>
          
          //         <tr>
          //             <td style="text-align: center;"><p style="font-size: 16px; line-height: 25px; color: #FFF; margin: 0; padding: 0; font-family: 'Poppins', sans-serif;">${formData.text}</p></td>
          //         </tr>
          
          //         <tr>
          //             <td style="text-align: center; padding: 28px 0;"><p style="font-size: 16px; line-height: 25px; color: #FFF; margin: 0; padding: 0; font-family: 'Poppins', sans-serif;"> Simply scan the QR code at the reader.</p></td>
          //         </tr>
          
          //         <tr style="text-align: center;">
          //             <td><img style="max-width: 100%;border: 1px solid white ;border-radius: 25px;" src="${process.env.image_url}/1672655085339-qrcode.png" alt=""/></td>
          //         </tr>
          
          //         <tr style="text-align: center;">
          //             <td><img style="width: 100%; position: relative; top: 8px;" src="${process.env.image_url}/lower-image.jpg" alt=""/></td>
          //         </tr>
          //     </tbody>
          //     </table>
              
               
          // </div>
          //     <div style="text-align: center;">
          //         <a style="display: inline-block; width: 100%; border: 1px solid #949594; border-radius: 50px; padding: 15px 0; margin-top: 25px; margin-bottom: 25px; text-decoration: none; font-size: 20px; color: #005ad1;" href=""> Detlis </a>
          //     </div>
          //   </body>
          // </html>`,
        };

        transporter.mailConnection.sendMail (mailOptions, (error, info) => {
          if (error) {
            console.log (error);
          } else {
            console.log ('Email sent: ' + info.response);
          }
        });

        ///// email send /////

        //  send response
        res.json ({
          status: 'successfull',
          message: `Card send successfully on ${formData.email} `,
          code: code,
        });
      } else {
        res.json ({
          status: 'error',
          message: {
            logo: 'Logo and Hero Image should not be blank OR image should be jpeg | jpg | png format',
          },
        });
      }
    }
  },
};

function makeid (length) {
  var result = '';
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt (
      Math.floor (Math.random () * charactersLength)
    );
  }
  return result;
}

async function resize (path, name) {
  // Read the image.
  const image = await Jimp.read (path);
  // Resize the image to width 150 and heigth 150.
  await image.resize (407, 143).quality (80);
  // Save and overwrite the image
  await image.writeAsync (name);
}


async function resize2 (path, name) {
  // Read the image.
  const image = await Jimp.read (path);
  // Resize the image to width 150 and heigth 150.
  await image.resize (703, 281).quality (80);
  // Save and overwrite the image
  await image.writeAsync (name);
}

