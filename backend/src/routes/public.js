import express from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import AboutStat from '../models/AboutStat.js';
import Department from '../models/Department.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// ── GET About Stats ──────────────────────────────────────────────────────────
router.get('/about-stats', async (req, res) => {
  try {
    const stats = await AboutStat.find().sort({ order: 1 });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching about stats:', error);
    res.status(500).json({ error: 'Failed to fetch about stats' });
  }
});

// 10 MB file size limit, memory storage for Cloudinary streaming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF and Word documents (.pdf, .doc, .docx) are allowed'));
  }
});

// ── Helper: stream buffer to Cloudinary ──────────────────────────────────────
const uploadToCloudinary = (buffer, originalName) => {
  return new Promise((resolve, reject) => {
    const safeName = (originalName || 'resume').replace(/\s+/g, '_');
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'resumes',
        use_filename: true,
        unique_filename: true,
        public_id: `resumes/${Date.now()}_${safeName}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ── GET /api/public/jobs ─ All open jobs ─────────────────────────────────────
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({ isOpen: true }).sort({ createdAt: -1 });
    
    // Fetch all departments to map their images to jobs
    const departments = await Department.find({});
    const deptImageMap = {};
    departments.forEach(dept => {
      if (dept.image) {
        deptImageMap[dept.name] = dept.image;
      }
    });

    const formattedJobs = jobs.map(j => {
      const obj = j.toJSON();
      obj.id = obj.id || obj._id.toString();
      obj.image = deptImageMap[obj.category] || '';
      return obj;
    });
    res.json(formattedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ── GET /api/public/jobs/:id ─ Single job details ────────────────────────────
router.get('/jobs/:id', async (req, res) => {
  try {
    const paramId = req.params.id;
    // Try custom string id first, then MongoDB _id
    let job = await Job.findOne({ id: paramId, isOpen: true });
    if (!job && mongoose.isValidObjectId(paramId)) {
      job = await Job.findById(paramId);
    }
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ error: 'Failed to fetch job details' });
  }
});

// ── POST /api/public/apply ─ Submit application ───────────────────────────────
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const { 
      jobId, 
      name, 
      email, 
      phone, 
      linkedin, 
      portfolio, 
      github, 
      location, 
      yearsExperience, 
      currentCompany, 
      expectedSalary, 
      coverLetter, 
      customAnswers 
    } = req.body;

    // Validate required fields
    if (!jobId) {
      return res.status(400).json({
        error: 'Missing required fields: jobId is required'
      });
    }

    // Look up the actual job to confirm it exists
    let job = null;
    if (mongoose.isValidObjectId(jobId)) {
      job = await Job.findById(jobId);
    }
    if (!job) {
      job = await Job.findOne({ id: jobId });
    }
    if (!job) {
      job = await Job.findOne({ title: jobId });
    }
    if (!job) {
      // Fallback for static frontend jobs without a database entry
      job = { id: jobId, title: jobId };
    }

    // Parse custom answers
    let parsedAnswers = [];
    if (customAnswers) {
      try {
        parsedAnswers = typeof customAnswers === 'string' ? JSON.parse(customAnswers) : customAnswers;
      } catch (e) {
        console.warn('Failed to parse customAnswers:', e.message);
      }
    }

    // Upload resume to Cloudinary
    let resumeUrl = '';
    let cloudinaryWarning = null;
    if (req.file) {
      try {
        console.log(`[Cloudinary] Uploading: ${req.file.originalname} (${req.file.size} bytes)`);
        const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        resumeUrl = result.secure_url;
        console.log(`[Cloudinary] Success: ${resumeUrl}`);
      } catch (uploadError) {
        // Non-fatal: save application but warn about missing resume
        cloudinaryWarning = `Resume upload failed (${uploadError.message}). Application saved without resume.`;
        console.error('[Cloudinary] Upload failed (non-fatal):', uploadError.message);
      }
    } else if (req.body.resumeUrl) {
      resumeUrl = req.body.resumeUrl;
    }

    // Create the application record
    const newApp = new Application({
      id: new mongoose.Types.ObjectId().toString(),
      jobId: job.id || job._id.toString(),
      userId: `public::${email}`,   // stable public identifier (no user account needed)
      applicantName: name,           // stored directly for admin panel display
      applicantEmail: email,
      phone,
      linkedin: linkedin || '',
      portfolio: portfolio || '',
      github: github || '',
      location: location || '',
      yearsExperience: yearsExperience || '',
      currentCompany: currentCompany || '',
      expectedSalary: expectedSalary || '',
      coverLetter: coverLetter || '',
      resume: resumeUrl,
      resumeFileUrl: resumeUrl,
      resumeFileName: req.file ? req.file.originalname : '',
      resumeMimeType: req.file ? req.file.mimetype : '',
      customAnswers: parsedAnswers,
      status: 'PENDING'
    });

    await newApp.save();

    console.log(`[Apply] Saved: ${newApp._id} | Job: "${job.title}" | ${name} <${email}>`);

    res.status(201).json({
      success: true,
      message: cloudinaryWarning
        ? 'Application submitted! (Resume upload had an issue — please check Cloudinary config)'
        : 'Application submitted successfully!',
      applicationId: newApp._id,
      jobTitle: job.title,
      resumeUrl: resumeUrl || null,
      warning: cloudinaryWarning || undefined
    });
  } catch (error) {
    console.error('[Apply] Error:', error);
    res.status(500).json({ error: 'Failed to submit application', detail: error.message });
  }
});

// ── Email OTP Endpoints ───────────────────────────────────────────────────────

// In-memory store for OTPs (email -> { otp, expiresAt })
// Note: For a production app, use Redis or MongoDB for this.
const otpStore = new Map();

// Helper to create mail transporter
const getTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Fallback to Ethereal dummy account for testing if no SMTP config is provided
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

router.post('/send-email-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10 minute expiration
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 
    });

    // Send Email
    const transporter = await getTransporter();
    
    const info = await transporter.sendMail({
      from: '"LocalSM Hiring" <noreply@localsm.tech>',
      to: email,
      subject: "Your OTP for LocalSM Application",
      text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `<b>Your verification code is: ${otp}</b><br>It will expire in 10 minutes.`,
    });

    console.log(`[Email OTP] Sent to ${email}: ${otp}`);
    if (!process.env.SMTP_HOST) {
      console.log("[Email OTP] Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('[Email OTP] Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

router.post('/verify-email-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ error: 'OTP not requested or expired' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (record.otp === otp) {
      otpStore.delete(email);
      return res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('[Verify Email OTP] Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});
// ── Phone OTP Endpoints ───────────────────────────────────────────────────────

router.post('/send-phone-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10 minute expiration
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 
    });

    if (process.env.FAST2SMS_API_KEY) {
      // Send Real SMS via Fast2SMS
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': process.env.FAST2SMS_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          variables_values: otp,
          route: 'otp',
          numbers: phone.replace(/\D/g, '').slice(-10) // Always take the last 10 digits for Fast2SMS
        })
      });
      
      const data = await response.json();
      if (!data.return) {
        throw new Error(data.message || 'Fast2SMS failed to send');
      }
    } else {
      // Fallback: Mock SMS in Console
      console.log('----------------------------------------------------');
      console.log(`[MOCK SMS] To: ${phone} | OTP: ${otp}`);
      console.log('----------------------------------------------------');
    }

    res.json({ success: true, message: 'Phone OTP sent' });
  } catch (error) {
    console.error('[Send Phone OTP] Error:', error);
    res.status(500).json({ error: 'Failed to send Phone OTP', detail: error.message });
  }
});

router.post('/verify-phone-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const record = otpStore.get(phone);
    if (!record) {
      return res.status(400).json({ error: 'OTP not requested or expired' });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (record.otp === otp) {
      otpStore.delete(phone);
      return res.json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('[Verify Phone OTP] Error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

export default router;
