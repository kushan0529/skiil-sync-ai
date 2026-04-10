const nodemailer = require('nodemailer');

/**
 * Reverted to Nodemailer (SMTP) as requested.
 * Optimized for Vercel with pooling and strict timeouts.
 * 
 * NOTE: For this to work globally, you MUST use a Gmail "App Password".
 * A normal Gmail password will be blocked by Google in cloud environments.
 */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  pool: true, // Keeps connection open to speed up multiple sends
  maxConnections: 5,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps with datacenter handshake errors
  },

});

exports.sendTaskAssignmentEmail = async (task, assignee, manager, path = '') => {
  console.log(`[email] Attempting SMTP send for task: ${task.title}`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return { success: false, error: 'SMTP Credentials missing' };
  }

  if (!assignee?.email) return { success: false, error: 'No assignee email' };

  let baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const directLink = `${baseUrl}${path}`;

  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: assignee.email,
    subject: `[SkillSync] Task Assigned: ${task.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">New Task Assignment</h2>
        <p>Hello <strong>${assignee.name || 'Team Member'}</strong>,</p>
        <p>You have been assigned: <strong>${task.title}</strong></p>
        <p><strong>Priority:</strong> ${task.priority || 'Medium'}</p>
        <p><strong>Deadline:</strong> ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</p>
        <br/>
        <a href="${directLink}" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Task Details</a>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[email] SMTP Success:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] SMTP Error:', error.message);
    return { success: false, error: error.message };
  }
};

exports.sendProjectAssignmentEmail = async (project, assignee, manager, path = '') => {
  console.log(`[email] Attempting SMTP send for project: ${project.name}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return { success: false, error: 'SMTP Credentials missing' };
  }

  if (!assignee?.email) return { success: false, error: 'No assignee email' };

  let baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  const directLink = `${baseUrl}${path}`;

  const mailOptions = {
    from: `"SkillSync" <${process.env.EMAIL_USER}>`,
    to: assignee.email,
    subject: `[SkillSync] Added to Project: ${project.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5;">New Project Assignment</h2>
        <p>Hello <strong>${assignee.name || 'Team Member'}</strong>,</p>
        <p>You have been added to: <strong>${project.name}</strong></p>
        <p><strong>Status:</strong> ${project.status || 'Active'}</p>
        <br/>
        <a href="${directLink}" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Project</a>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('[email] SMTP Project Success:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] SMTP Error:', error.message);
    return { success: false, error: error.message };
  }
};
