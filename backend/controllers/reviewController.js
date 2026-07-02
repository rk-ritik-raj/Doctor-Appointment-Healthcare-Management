const Review = require('../models/Review');
const Doctor = require('../models/Doctor');

// @desc    Create a review for a doctor
// @route   POST /api/reviews
// @access  Private (Patient only)
const createReview = async (req, res, next) => {
  const { doctorId, rating, comment } = req.body;

  try {
    // Check if the doctor profile exists
    const doctorProfile = await Doctor.findOne({ user: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    // Prevent doctor from reviewing themselves
    if (doctorId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot write reviews for yourself' });
    }

    // Check if user already reviewed this doctor
    const alreadyReviewed = await Review.findOne({ doctor: doctorId, patient: req.user._id });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this doctor' });
    }

    // Create review
    const review = await Review.create({
      doctor: doctorId,
      patient: req.user._id,
      rating: Number(rating),
      comment,
    });

    // Calculate average rating
    const reviews = await Review.find({ doctor: doctorId });
    const numReviews = reviews.length;
    const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    doctorProfile.rating = avgRating;
    doctorProfile.numReviews = numReviews;
    await doctorProfile.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a doctor
// @route   GET /api/reviews/doctor/:id
// @access  Public
const getDoctorReviews = async (req, res, next) => {
  const { id } = req.params;

  try {
    const reviews = await Review.find({ doctor: id })
      .populate('patient', 'name profilePicture')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getDoctorReviews,
};
