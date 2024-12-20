const transporter = require('../helpers/emailConfig');
const fs = require('fs');
const crypto = require('crypto');

exports.sendVerificationEmail = (user, verificationToken) => {
  let emailSubject;
  let emailTemplate;
  let emailRecipient;

  emailSubject = 'Email Verification for Your Account';

  
  const template = fs.readFileSync(
    './emailTemplates/accountVerification.html',
    'utf-8'
  );

  
  emailTemplate = template.replace('{{full_name}}', user.full_name)
    .replace('{{verification_link}}', `${process.env.CLIENT_URL}/api/verify-email?token=${verificationToken}`);

  emailRecipient = user.email;

  const mailOptions = {
    to: emailRecipient,
    subject: emailSubject,
    html: emailTemplate,
  };

  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`Error occurred while sending the email: ${error}`);
    } else {
      console.log('Verification email sent successfully!');
    }
  });
};
