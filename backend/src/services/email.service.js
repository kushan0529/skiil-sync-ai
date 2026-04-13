// const nodemailer = require('nodemailer');

// /**
//  * Reverted to Nodemailer (SMTP) as requested.
//  * Optimized for Vercel with pooling and strict timeouts.
//  * 
//  * NOTE: For this to work globally, you MUST use a Gmail "App Password".
//  * A normal Gmail password will be blocked by Google in cloud environments.
//  */

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//   port: parseInt(process.env.EMAIL_PORT) || 465,
//   secure: parseInt(process.env.EMAIL_PORT) === 465,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false
//   },
//   connectionTimeout: 20000,
//   greetingTimeout: 20000,
//   logger: true, // Log SMTP handshake details
//   debug: true,  // Include detailed debug output
// });

// // Verify connection on startup
// transporter.verify((error, success) => {
//   if (error) {
//     console.error('[email] SMTP Verification Failed:', error.message);
//   } else {
//     console.log('[email] SMTP Server is ready to take our messages');
//   }
// });

// exports.sendTaskAssignmentEmail = async (task, assignee, manager, path = '') => {
//   console.log(`[email] Attempting SMTP send for task: ${task.title} to recipient: ${assignee.email}`);

//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//     return { success: false, error: 'SMTP Credentials missing' };
//   }

//   if (!assignee?.email) return { success: false, error: 'No assignee email' };

//   let baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
//   const directLink = `${baseUrl}${path}`;

//   const mailOptions = {
//     from: `"SkillSync" <${process.env.EMAIL_USER}>`,
//     to: assignee.email,
//     subject: `[SkillSync] Task Assigned: ${task.title}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
//         <h2 style="color: #4f46e5;">New Task Assignment</h2>
//         <p>Hello <strong>${assignee.name || 'Team Member'}</strong>,</p>
//         <p>You have been assigned: <strong>${task.title}</strong></p>
//         <p><strong>Priority:</strong> ${task.priority || 'Medium'}</p>
//         <p><strong>Deadline:</strong> ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</p>
//         <br/>
//         <a href="${directLink}" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Task Details</a>
//       </div>
//     `,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('[email] SMTP Success:', info.messageId);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error('[email] SMTP Error:', error.message);
//     return { success: false, error: error.message };
//   }
// };

// exports.sendProjectAssignmentEmail = async (project, assignee, manager, path = '') => {
//   console.log(`[email] Attempting SMTP send for project: ${project.name} to recipient: ${assignee.email}`);

//   if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
//     return { success: false, error: 'SMTP Credentials missing' };
//   }

//   if (!assignee?.email) return { success: false, error: 'No assignee email' };

//   let baseUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
//   const directLink = `${baseUrl}${path}`;

//   const mailOptions = {
//     from: `"SkillSync" <${process.env.EMAIL_USER}>`,
//     to: assignee.email,
//     subject: `[SkillSync] Added to Project: ${project.name}`,
//     html: `
//       <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
//         <h2 style="color: #4f46e5;">New Project Assignment</h2>
//         <p>Hello <strong>${assignee.name || 'Team Member'}</strong>,</p>
//         <p>You have been added to: <strong>${project.name}</strong></p>
//         <p><strong>Status:</strong> ${project.status || 'Active'}</p>
//         <br/>
//         <a href="${directLink}" style="background: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Project</a>
//       </div>
//     `,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('[email] SMTP Project Success:', info.messageId);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error('[email] SMTP Error:', error.message);
//     return { success: false, error: error.message };
//   }
// };




















const nodemailer = require('nodemailer');
const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const useBrevo = !!BREVO_API_KEY;

if (useBrevo) {
  console.log('[email] Using Brevo API (Bypassing Render SMTP block)');
}

const SMTP_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.EMAIL_PORT || 465);
const SMTP_SECURE = SMTP_PORT === 465;

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('[email] Missing EMAIL_USER or EMAIL_PASS in environment variables');
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  family: 4, // Force IPv4 to solve ENETUNREACH IPv6 issues on cloud providers
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
  logger: true,
  debug: true,
});

const getBaseUrl = () => {
  return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const buildEmailLayout = ({ title, greetingName, intro, fields = [], buttonText, buttonLink }) => {
  const rows = fields
    .filter(field => field.value !== undefined && field.value !== null && field.value !== '')
    .map(
      field => `
        <tr>
          <td style="padding: 8px 0; color: #555; font-weight: 600; width: 140px;">${field.label}</td>
          <td style="padding: 8px 0; color: #111;">${field.value}</td>
        </tr>
      `
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; background: #f5f7fb; padding: 24px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background: #4f46e5; color: white; padding: 20px 24px;">
          <h2 style="margin: 0; font-size: 22px;">${title}</h2>
        </div>

        <div style="padding: 24px;">
          <p style="margin-top: 0; font-size: 15px; color: #111;">
            Hello <strong>${greetingName || 'Team Member'}</strong>,
          </p>

          <p style="font-size: 15px; color: #374151; line-height: 1.6;">
            ${intro}
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            ${rows}
          </table>

          ${buttonLink
      ? `
              <div style="margin-top: 24px;">
                <a href="${buttonLink}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600;">
                  ${buttonText || 'Open'}
                </a>
              </div>
            `
      : ''
    }

          <p style="margin-top: 28px; font-size: 13px; color: #6b7280;">
            This is an automated email from SkillSync.
          </p>
        </div>
      </div>
    </div>
  `;
};

const sendEmail = async ({ to, subject, html }) => {
  if (useBrevo) {
    try {
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: { email: process.env.EMAIL_USER || 'noreply@skillsync.ai', name: 'SkillSync' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: html
      }, {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });
      console.log(`[email] Brevo API Success: Sent to ${to}. ID: ${response.data.messageId}`);
      return { success: true, messageId: response.data.messageId, provider: 'brevo' };
    } catch (error) {
      if (error.response) {
        console.error('[email] Brevo API Error:', JSON.stringify(error.response.data));
        // Common Brevo error: "sender_not_verified"
        return { 
          success: false, 
          error: error.response.data.message || 'Brevo API Error',
          code: error.response.data.code 
        };
      }
      console.error('[email] Brevo API Network/Unknown Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return { success: false, error: 'SMTP credentials missing' };
  }

  if (!to) {
    return { success: false, error: 'Recipient email missing' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"SkillSync" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log('[email] SMTP Success:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error('[email] SMTP Error:', error.message);
    return {
      success: false,
      error: error.message,
      code: error.code || null,
      response: error.response || null,
    };
  }
};

exports.verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('[email] SMTP server is ready');
    return { success: true };
  } catch (error) {
    console.error('[email] SMTP verification failed:', error.message);
    return { success: false, error: error.message };
  }
};

exports.sendTaskAssignmentEmail = async (task, assignee, manager, path = '') => {
  console.log(`[email] Sending task assignment email for task: ${task?.title} to: ${assignee?.email}`);

  if (!assignee?.email) {
    return { success: false, error: 'No assignee email' };
  }

  const directLink = `${getBaseUrl()}${path}`;

  const html = buildEmailLayout({
    title: 'New Task Assignment',
    greetingName: assignee?.name,
    intro: `You have been assigned a new task in SkillSync.`,
    fields: [
      { label: 'Task', value: task?.title || 'N/A' },
      { label: 'Priority', value: task?.priority || 'Medium' },
      { label: 'Deadline', value: formatDate(task?.deadline) },
      { label: 'Assigned By', value: manager?.name || manager?.email || 'Manager' },
    ],
    buttonText: 'View Task Details',
    buttonLink: directLink,
  });

  return await sendEmail({
    to: assignee.email,
    subject: `[SkillSync] Task Assigned: ${task?.title || 'New Task'}`,
    html,
  });
};

exports.sendProjectAssignmentEmail = async (project, assignee, manager, path = '') => {
  console.log(`[email] Sending project assignment email for project: ${project?.name} to: ${assignee?.email}`);

  if (!assignee?.email) {
    return { success: false, error: 'No assignee email' };
  }

  const directLink = `${getBaseUrl()}${path}`;

  const html = buildEmailLayout({
    title: 'New Project Assignment',
    greetingName: assignee?.name,
    intro: `You have been added to a project in SkillSync.`,
    fields: [
      { label: 'Project', value: project?.name || 'N/A' },
      { label: 'Status', value: project?.status || 'Active' },
      { label: 'Assigned By', value: manager?.name || manager?.email || 'Manager' },
    ],
    buttonText: 'View Project',
    buttonLink: directLink,
  });

  return await sendEmail({
    to: assignee.email,
    subject: `[SkillSync] Added to Project: ${project?.name || 'Project'}`,
    html,
  });
};
