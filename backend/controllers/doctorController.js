const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Get all doctors (with filters and search)
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { search, specialization, city, experience, minRating, maxFee, availableToday } = req.query;

    let query = { isApproved: 'approved' }; // Only show approved doctors publicly

    // Filter by Specialization
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // Filter by Hospital City
    if (city) {
      query['hospital.city'] = { $regex: city, $options: 'i' };
    }

    // Filter by Experience (minimum years)
    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    // Filter by Rating
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Filter by Max Consultation Fee
    if (maxFee) {
      query.consultationFee = { $lte: Number(maxFee) };
    }

    // Filter by Available Today (e.g. checks if today's day is in availability.days)
    if (availableToday === 'true') {
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const todayName = daysOfWeek[new Date().getDay()];
      query['availability.days'] = todayName;
    }

    // Perform queries
    let doctors = await Doctor.find(query).populate('user', 'name email profilePicture');

    // Handle search query (searches across User Name or Specialization)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      doctors = doctors.filter((doc) => {
        return (
          doc.user.name.match(searchRegex) ||
          doc.specialization.match(searchRegex) ||
          doc.hospital.name.match(searchRegex)
        );
      });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find doctor by User ID or Doctor ID
    let doctor = await Doctor.findOne({ user: id }).populate('user', 'name email profilePicture');
    if (!doctor) {
      doctor = await Doctor.findById(id).populate('user', 'name email profilePicture');
    }

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      name,
      specialization,
      experience,
      biography,
      consultationFee,
      languages,
      hospital,
      qualifications,
    } = req.body;

    let doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      doctor = await Doctor.create({ user: req.user._id });
    }

    const user = await User.findById(req.user._id);

    // Handle profile image upload
    let profilePictureUrl = user.profilePicture;
    let certificatesUrls = [...doctor.certificates];

    if (req.files) {
      const isCloudinaryActive = process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME.includes('mock_');

      // Upload profile picture if provided
      if (req.files.profilePicture) {
        const file = req.files.profilePicture[0];
        if (isCloudinaryActive) {
          try {
            const result = await cloudinary.uploader.upload(file.path, { folder: 'medicare/profiles' });
            profilePictureUrl = result.secure_url;
            fs.unlinkSync(file.path);
          } catch (e) {
            profilePictureUrl = `/uploads/${file.filename}`;
          }
        } else {
          profilePictureUrl = `/uploads/${file.filename}`;
        }
      }

      // Upload certificates if provided
      if (req.files.certificates) {
        for (const file of req.files.certificates) {
          if (isCloudinaryActive) {
            try {
              const result = await cloudinary.uploader.upload(file.path, { folder: 'medicare/certificates' });
              certificatesUrls.push(result.secure_url);
              fs.unlinkSync(file.path);
            } catch (e) {
              certificatesUrls.push(`/uploads/${file.filename}`);
            }
          } else {
            certificatesUrls.push(`/uploads/${file.filename}`);
          }
        }
      }
    }

    // Save user update
    if (name) user.name = name;
    user.profilePicture = profilePictureUrl;
    await user.save();

    // Save doctor details update
    doctor.specialization = specialization || doctor.specialization;
    doctor.experience = experience !== undefined ? Number(experience) : doctor.experience;
    doctor.biography = biography !== undefined ? biography : doctor.biography;
    doctor.consultationFee = consultationFee !== undefined ? Number(consultationFee) : doctor.consultationFee;
    doctor.certificates = certificatesUrls;

    if (languages) {
      doctor.languages = typeof languages === 'string' ? JSON.parse(languages) : languages;
    }

    if (qualifications) {
      doctor.qualifications = typeof qualifications === 'string' ? JSON.parse(qualifications) : qualifications;
    }

    if (hospital) {
      const parsedHospital = typeof hospital === 'string' ? JSON.parse(hospital) : hospital;
      doctor.hospital = { ...doctor.hospital, ...parsedHospital };
    }

    await doctor.save();

    const updatedDoctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email profilePicture');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's appointments
// @route   GET /api/doctors/appointments
// @access  Private (Doctor only)
const getDoctorAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'name email profilePicture')
      .populate('prescription')
      .sort('-date');

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor availability slots
// @route   PUT /api/doctors/availability
// @access  Private (Doctor only)
const updateAvailability = async (req, res, next) => {
  const { days, timeSlots } = req.body;

  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (days) doctor.availability.days = days;
    if (timeSlots) doctor.availability.timeSlots = timeSlots;

    await doctor.save();

    res.status(200).json({
      success: true,
      message: 'Availability schedule updated successfully',
      availability: doctor.availability,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorProfile,
  getDoctorAppointments,
  updateAvailability,
};
