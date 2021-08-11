module.exports.contactUs = (name, messege, email, phone) => {
  return `
  <div
  style="padding:30px 0 ;font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;text-align: center; background-color:#051c22; color:#080808; border-radius: 5px;">
  
  <span
          style="font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; color: rgb(120, 199, 166); font-size:x-large;">Soul</span>
          <p style="font-size:1.3rem; font-weight:bold">
      User Inquiry 
  </p>
  <hr style="width:50%; color: black;" />

  <div style="font-size: 1rem; color: white; padding-left: 50px; padding-bottom:20px; text-align: left;">
  <p>Messege from:<span style="color: green;"> ${name}<span/> </p>
      <p>About: ${messege} </p>
      <p>Phone number: ${phone} </p>
      <p>Sender email: <b><i>${email}</i></b> <br>
      </p>
  </div>

</div>
      `;
};
