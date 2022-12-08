const nodemailer = require("nodemailer");
async function sendMail(receiver,text ){ 
  try{
    const transport = nodemailer.createTransport({
      service: 'gmail',
      host: process.env.DOMAIN,
      port: 465,
      auth: {
        user: process.env.MAILUSER,
        pass: process.env.MAILPASS ,
      }
    })

    const mailOpts = {
      
      from:process.env.MAILUSER ,
      to: receiver,
      subject: "Forget Details",
      text: "That was Easy",
      html: `
      <hr>
      <b><ol><li>This is a system generated mail. Please do not reply to this email ID. If you have a query or need any clarification you may: </li>
<li> Call our 24-hour Customer Care or</li>
<li>Email Us ${process.env.MAILUSER}</li>
<ol></b>
<hr>
<br>

<b><h3> Do Not Share This Link</h3></b>
      <a href="${text}"><button >Click Here To Change Password </button></a>
      <br>
      <br>
      <br>
        
Warm Regards, <br>
Customer Care <br>
Bonza pvt ltd <br>

      `
    }

    const result = await transport.sendMail(mailOpts);
    console.log(result);
    return result;
  } 
  catch(err){
    console.log(err);
    return err;
  }
}


module.exports = sendMail;