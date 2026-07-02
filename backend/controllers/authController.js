const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const generateToken = require('../utils/token');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { name, email, password, role, doctorDetails } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create base user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      verificationToken,
    });

    // Create associated profile based on role
    if (user.role === 'patient') {
      await Patient.create({
        user: user._id,
      });
    } else if (user.role === 'doctor') {
      const { specialization, experience, consultationFee, hospital } = doctorDetails || {};
      await Doctor.create({
        user: user._id,
        specialization: specialization || 'General Physician',
        experience: experience || 1,
        consultationFee: consultationFee || 500,
        qualifications: doctorDetails?.qualifications || ['MBBS'],
        hospital: {
          name: hospital?.name || 'General Hospital',
          city: hospital?.city || 'Default City',
          address: hospital?.address || '',
        },
        isApproved: 'pending', // Admins must approve doctors
      });
    }

    // Send Verification Email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    const message = `Welcome to Medicare, ${name}!\n\nPlease verify your email by clicking the link below:\n\n${verificationUrl}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #2563EB;">Welcome to Medicare</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering on Medicare. Please verify your email to unlock your platform dashboard:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #2563EB, #3B82F6); color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0;">Verify Email Address</a>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="color: #64748B; font-size: 14px;">${verificationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">This is an automated message, please do not reply.</p>
      </div>
    `;

    const emailSent = await sendEmail({
      email: user.email,
      subject: 'Medicare Email Verification',
      message,
      html,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Verification email sent.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      // Send token directly in dev fallback so they don't have to check email
      verificationToken: process.env.NODE_ENV !== 'production' ? verificationToken : undefined,
      emailSent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email address
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res, next) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email successfully verified! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user with password included
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if verified (we can warning/block or skip in development)
    if (!user.isVerified && process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Please verify your email address first.' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email address not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const message = `You requested a password reset. Please use the following link to reset your password:\n\n${resetUrl}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
        <h2 style="color: #2563EB;">Password Reset Request</h2>
        <p>We received a request to reset your password. Click below to specify a new password (valid for 10 minutes):</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #EF4444; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="color: #64748B; font-size: 14px;">${resetUrl}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8;">If you did not make this request, you can safely ignore this email.</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Medicare Password Reset Request',
      message,
      html,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    // Hash token to match database format
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
};
