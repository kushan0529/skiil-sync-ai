const nodemailer = require('nodemailer');

// Helper to determine secure setting based on port
const isSecure = process.env.EMAIL_PORT == 465;

console.log('[email] Initializing transporter with:', {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: isSecure,
  user: process.env.EMAIL_USER ? 'Present' : 'MISSING'
});

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || 587),
  secure: isSecure, 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('[email] !!! Transporter verification FAILED:', error.message);
  } else {
    console.log('[email] --- Transporter is ready to send emails ---');
  }
});

exports.sendTaskAssignmentEmail = async (task, assignee, manager, path = '') => {
  console.log(`[email] Attempting to send assignment email for task: "${task.title}"`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[email] Error: EMAIL_USER or EMAIL_PASS missing in .env');
    return { success: false, error: 'Credentials missing' };
  }

  if (!assignee || !assignee.email) {
    console.error('[email] Error: Assignee email is missing');
    return { success: false, error: 'Assignee email missing' };
  }

  const recipients = [assignee.email];
  if (manager && manager.email) {
    recipients.push(manager.email);
  }

  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const directLink = `${baseUrl}${path}`;

  console.log(`[email] Recipients: ${recipients.join(', ')}`);
  console.log(`[email] Link: ${directLink}`);

  const mailOptions = {
    from: `"SkillSync Notifications" <${process.env.EMAIL_USER}>`,
    to: recipients,
    subject: `[SkillSync] Task Assigned: ${task.title}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; color: #1a202c; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; padding: 10px; background: #f0f4ff; border-radius: 12px; margin-bottom: 10px;">
            <span style="font-size: 30px;">📋</span>
          </div>
          <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">New Task Assignment</h1>
          <p style="color: #718096; font-size: 16px; margin-top: 5px;">SkillSync Project Management</p>
        </div>
        
        <div style="padding: 20px; border-top: 1px solid #edf2f7;">
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${assignee.name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">You have been assigned a new task by <strong>${manager.name}</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5;">
            <h3 style="margin-top: 0; color: #2d3748; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Task Information</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 10px 0; color: #718096; width: 100px;"><strong>Title:</strong></td>
                <td style="padding: 10px 0; color: #1a202c; font-weight: 600;">${task.title}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;"><strong>Priority:</strong></td>
                <td style="padding: 10px 0;"><span style="background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; text-transform: uppercase;">${task.preference || task.priority || 'Medium'}</span></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;"><strong>Deadline:</strong></td>
                <td style="padding: 10px 0; color: #1a202c;">${task.deadline ? new Date(task.deadline).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No deadline set'}</td>
              </tr>
            </table>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #cbd5e0;">
              <p style="color: #718096; margin-bottom: 8px;"><strong>Description:</strong></p>
              <p style="color: #4a5568; margin-top: 0; line-height: 1.6; font-size: 15px;">${task.description || 'No description provided.'}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 35px;">
            <a href="${directLink}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.39);">
              Open Task Details
            </a>
            <p style="font-size: 13px; color: #a0aec0; margin-top: 15px;">Or copy this link: <br/> <span style="color: #4f46e5;">${directLink}</span></p>
          </div>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;" />
        <p style="font-size: 12px; color: #a0aec0; text-align: center; line-height: 1.5;">
          This is an automated notification from SkillSync.<br/>
          If you have any questions, please contact your project manager.
        </p>
      </div>
    `,
  };

  try {
    console.log('[email] Sending via transporter...');
    const info = await transporter.sendMail(mailOptions);
    console.log(`[email] Success! Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] !!! Error sending email:', error);
    return { success: false, error: error.message };
  }
};


  // the message of sending the email is not showing higlighted on the screen , also after the parsing of resume ,    
  //     it is not waiting till asssigning , also at the time of registration i entered dummy email , it is accepting   
  //     it,it is not checking that the email is existing or not      


  //  the email is sending to the user only when the task is assigned to the user , but it is not sending the email    
  //  when project is assigned to the user , check and chnage it for both cases to work , in the term of sending       
  //  emails , the total details of the project need to be mentioned , also the email has the link of relocating       
  //  the skillsync page is not working 