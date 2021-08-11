module.exports.resetPassword = (name, resetPasswordLink) => {
  return `

  <div
  style="padding:30px 0 ;font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;text-align: center; background-color:#051c22; color:#080808; border-radius: 5px;">
  <p style="font-size:1.3rem; font-weight:bold">
      Welcome to <span
          style="font-family:'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif; color: rgb(120, 199, 166); font-size:x-large;">Soul</span>
  </p>
  <hr style="width:50%; color: black;" />
  <h3 style="text-align: left; padding-left: 50px; margin-bottom: 2rem;color: white;">Hello, ${name}</h3>
  <div style="font-size: 1rem; color: white; padding-left: 50px; padding-bottom:20px; text-align: left;">

      <p>You're one step away from reseting your password, press the button below to reset it. <strong>Note
              that, this link is valid for the next 60 minutes only.</strong> </p>
  </div>
  <p style="text-align: center;"><a
          style="display: inline-block; padding:10px;background-color:rgb(132, 226, 132); color:rgb(0, 0, 0);text-decoration: none;cursor: pointer;box-shadow: 0 0 8px gray; border-radius: 10px;"
          href="${resetPasswordLink}"><strong>Reset password</strong></a></p>
</div>
      `;
};
