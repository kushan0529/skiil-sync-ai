const nodemailer = require('nodemailer');

/**
 * Robust Email Service for SkillSync
 * Configured specifically for Vercel Serverless environment.
 */

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Critical for some cloud/datacenter environments
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 5000, // 5 seconds - keep it tight for Vercel
  greetingTimeout: 5000,
  socketTimeout: 5000,
  debug: true, // Show debug output in Vercel logs
  logger: true  // Log to console
});

exports.sendTaskAssignmentEmail = async (task, assignee, manager, path = '') => {
  console.log(`[email] --- Starting Task Email Process for "${task.title}" ---`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[email] Error: EMAIL_USER or EMAIL_PASS missing in environment');
    return { success: false, error: 'Credentials missing in Vercel environment' };
  }

  if (!assignee || !assignee.email) {
    console.error('[email] Error: Assignee email is missing');
    return { success: false, error: 'Assignee email missing' };
  }

  let baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const directLink = `${baseUrl}${path}`;

  const mailOptions = {
    from: `"SkillSync Notifications" <${process.env.EMAIL_USER}>`,
    to: assignee.email,
    cc: (manager && manager.email && manager.email !== assignee.email) ? manager.email : undefined,
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
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${assignee.name || 'Team Member'}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">You have been assigned a new task by <strong>${manager?.name || 'your Project Manager'}</strong>.</p>
          
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
    console.log(`[email] Sending task email to ${assignee.email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[email] Task email SUCCESS: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] !!! Task email FAILURE:', error.message);
    return { success: false, error: error.message };
  }
};

exports.sendProjectAssignmentEmail = async (project, assignee, manager, path = '') => {
  console.log(`[email] --- Starting Project Email Process for "${project.name}" ---`);
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[email] Error: EMAIL_USER or EMAIL_PASS missing in environment');
    return { success: false, error: 'Credentials missing' };
  }

  if (!assignee || !assignee.email) {
    console.error('[email] Error: Assignee email is missing');
    return { success: false, error: 'Assignee email missing' };
  }

  let baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (baseUrl.endsWith('/')) {
    baseUrl = baseUrl.slice(0, -1);
  }
  const directLink = `${baseUrl}${path}`;

  const ownerName = project.owner?.name || manager?.name || 'Project Manager';

  const mailOptions = {
    from: `"SkillSync Notifications" <${process.env.EMAIL_USER}>`,
    to: assignee.email,
    cc: (manager && manager.email && manager.email !== assignee.email) ? manager.email : undefined,
    subject: `[SkillSync] Added to Project: ${project.name}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; color: #1a202c; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; padding: 10px; background: #f0f4ff; border-radius: 12px; margin-bottom: 10px;">
            <span style="font-size: 30px;">🚀</span>
          </div>
          <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">New Project Assignment</h1>
          <p style="color: #718096; font-size: 16px; margin-top: 5px;">SkillSync Collaboration</p>
        </div>
        
        <div style="padding: 20px; border-top: 1px solid #edf2f7;">
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${assignee.name || 'Team Member'}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">You have been added to a new project: <strong>${project.name}</strong> by <strong>${manager?.name || 'a Project Manager'}</strong>.</p>
          
          <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; margin: 25px 0; border: 1px solid #e2e8f0; border-left: 4px solid #4f46e5;">
            <h3 style="margin-top: 0; color: #2d3748; font-size: 18px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Project Overview</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 10px 0; color: #718096; width: 140px;"><strong>Project Name:</strong></td>
                <td style="padding: 10px 0; color: #1a202c; font-weight: 600;">${project.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;"><strong>Project Owner:</strong></td>
                <td style="padding: 10px 0; color: #1a202c;">${ownerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;"><strong>Status:</strong></td>
                <td style="padding: 10px 0;"><span style="background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; text-transform: uppercase;">${project.status || 'Active'}</span></td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;"><strong>Current Progress:</strong></td>
                <td style="padding: 10px 0;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 100px; background: #e2e8f0; height: 8px; border-radius: 4px;">
                      <div style="width: ${project.progress || 0}%; background: #4f46e5; height: 8px; border-radius: 4px;"></div>
                    </div>
                    <span style="font-size: 12px; font-weight: 700; color: #4f46e5;">${project.progress || 0}%</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;"><strong>Start Date:</strong></td>
                <td style="padding: 10px 0; color: #1a202c;">${project.startDate ? new Date(project.startDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Immediately'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;"><strong>Deadline:</strong></td>
                <td style="padding: 10px 0; color: #1a202c;">${project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Ongoing'}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #718096;"><strong>Required Skills:</strong></td>
                <td style="padding: 10px 0; color: #1a202c;">${project.requiredSkills && project.requiredSkills.length > 0 ? project.requiredSkills.join(', ') : 'Not specified'}</td>
              </tr>
            </table>
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #cbd5e0;">
              <p style="color: #718096; margin-bottom: 8px;"><strong>Project Description:</strong></p>
              <p style="color: #4a5568; margin-top: 0; line-height: 1.6; font-size: 15px;">${project.description || 'No description provided.'}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 35px;">
            <a href="${directLink}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.39);">
              View Project in SkillSync
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
    console.log(`[email] Sending project email to ${assignee.email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[email] Project email SUCCESS: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[email] !!! Project email FAILURE:', error.message);
    return { success: false, error: error.message };
  }
};
