const nodemailer = require("nodemailer");
const {google} = require("googleapis");


const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const CLIENT_ID = `440162361558-a6g5bialhgo794bqbouv2fq2jjlvhrqg.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//04VgARsV1FmHRCgYIARAAGAQSNwF-L9Ir1n6ch9WwX9HUULMmMmv6ZR9GqAd7wvlW0e3qecxc3W07D4jyxNb-BJzBHGY_MsCgD9Q`;

const oauthclient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauthclient.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendMail(receiver,text ){ 
  try{
    const access_token = await oauthclient.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user:"nxchikxt@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access_token
      }
    })

    const mailOpts = {
      from: "nxchikxt@gmail.com",
      to: "ymandlekar9826@gmail.com",
      subject: "Test test",
      text: "That was Easy",
      html: `<h1> hwllo </h1>`
    }

    const result = await transport.sendMail(mailOpts);
    return result;
  }
  catch(err){
    return err;
  }
}

module.exports = sendMail;