const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// @desc    Get Admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    // Revenue aggregates
    const paidAppointments = await Appointment.find({ paymentStatus: 'paid' });
    const totalRevenue = paidAppointments.reduce((acc, appt) => acc + (appt.amountPaid || 0), 0);

    const pendingApprovalsCount = await Doctor.countDocuments({ isApproved: 'pending' });

    // Analytics data for Chart.js
    // Aggregate status breakdown
    const pendingAppt = await Appointment.countDocuments({ status: 'pending' });
    const approvedAppt = await Appointment.countDocuments({ status: 'approved' });
    const completedAppt = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppt = await Appointment.countDocuments({ status: 'cancelled' });

    // Dummy trends data for UI display of patient registration timelines
    const currentYear = new Date().getFullYear();
    const registrationTrends = [
      { month: 'Jan', registrations: 12 },
      { month: 'Feb', registrations: 19 },
      { month: 'Mar', registrations: 32 },
      { month: 'Apr', registrations: 45 },
      { month: 'May', registrations: 78 },
      { month: 'Jun', registrations: 105 },
    ];

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalPatients,
          totalDoctors,
          totalAppointments,
          totalRevenue,
          pendingApprovalsCount,
        },
        chartData: {
          appointmentsBreakdown: {
            pending: pendingAppt,
            approved: approvedAppt,
            completed: completedAppt,
            cancelled: cancelledAppt,
          },
          registrationTrends,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors pending approval
// @route   GET /api/admin/doctors/pending
// @access  Private (Admin only)
const getPendingDoctors = async (req, res, next) => {
  try {
    const pendingDoctors = await Doctor.find({ isApproved: 'pending' })
      .populate('user', 'name email profilePicture');

    res.status(200).json({
      success: true,
      count: pendingDoctors.length,
      data: pendingDoctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject doctor
// @route   PUT /api/admin/doctors/:id/approve
// @access  Private (Admin only)
const approveDoctor = async (req, res, next) => {
  const { id } = req.params; // ID of Doctor profile
  const { decision } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(decision)) {
    return res.status(400).json({ success: false, message: 'Invalid decision choice. Use approved or rejected.' });
  }

  try {
    const doctor = await Doctor.findById(id).populate('user', 'name');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    doctor.isApproved = decision;
    await doctor.save();

    // Create system notification for the doctor user
    await Notification.create({
      user: doctor.user._id,
      title: `Platform Access ${decision.charAt(0).toUpperCase() + decision.slice(1)}`,
      message: `Your medical credentials application has been ${decision} by the platform administration team.`,
      type: 'system',
    });

    res.status(200).json({
      success: true,
      message: `Doctor status updated to: ${decision}`,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate reviews (delete spam reviews)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin only)
const deleteReview = async (req, res, next) => {
  const { id } = req.params;

  try {
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const doctorId = review.doctor;
    await review.deleteOne();

    // Recalculate average rating for doctor
    const reviews = await Review.find({ doctor: doctorId });
    const doctorProfile = await Doctor.findOne({ user: doctorId });

    if (doctorProfile) {
      const numReviews = reviews.length;
      const avgRating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;
      
      doctorProfile.rating = avgRating;
      doctorProfile.numReviews = numReviews;
      await doctorProfile.save();
    }

    res.status(200).json({
      success: true,
      message: 'Review successfully removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getPendingDoctors,
  approveDoctor,
  deleteReview,
};
