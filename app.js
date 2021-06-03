const nodemailer = require('nodemailer');
const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = 3000;

//Servir arquivos estáticos ao servidor.
app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

//Configurando o storage de upload
const storage = multer.diskStorage({
  destination: (req,file,callback) => {
    callback(null, './images');
  },

  filename: (req,file,callback) => {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
})


let upload = multer({
  storage
}).single('image');



app.get('/', (req,res) => {
  res.sendFile('./index.html');
});

app.post('/sendemail', (req, res) => {

  upload(req, res, (err) => {
    
    if(err) {
      console.log(err);
      return res.end("Algo deu errado :x");
    } else {
      
      let email = {
        to: req.body.to,
        subject: req.body.subject,
        body: req.body.body,
        path: req.file.path ? req.file.path : ''
      };

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'x',
          pass: 'x'
        }
      });

      const mailOptions = {
        from: 'gabrielbgamboa10@gmail.com',
        to: email.to,
        subject: email.subject,
        text:email.body,
        attachments: [
          {
            path: email.path
          }
        ]
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
        } else {
          console.log(`E-mail enviando com sucesso! ${info.response}`);
          fs.unlink(email.path, (err) => {
            if (err) {
              return res.send(err);
            } else {
              console.log('deleted');
              return res.redirect('/result.html');
            }
          });
        }
      });

      
    }
  });
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});