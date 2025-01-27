const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'temhauyar1905@gmail.com',
    pass: '123456'
  }
});

module.exports = {
  sendVerificationCode: async (email, code) => {
    const mailOptions = {
      from: 'temhauyar1905@gmail.com',
      to: email,
      subject: 'Doğrulama Kodu',
      text: `Doğrulama kodunuz: ${code}`
    };

    return await transporter.sendMail(mailOptions);
  }
}; 