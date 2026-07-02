const Patient = require('../models/Patient');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private (Patient only)
const getPatientProfile = async (req, res, next) => {
  try {
    let patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email role profilePicture');
    
    if (!patient) {
      // Lazy initialize profile if missing
      patient = await Patient.create({ user: req.user._id });
      patient = await patient.populate('user', 'name email role profilePicture');
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private (Patient only)
const updatePatientProfile = async (req, res, next) => {
  try {
    const { name, gender, dateOfBirth, bloodGroup, phone, address, emergencyContact, medicalHistory } = req.body;
    
    // Find patient profile
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      patient = await Patient.create({ user: req.user._id });
    }

    // Find user profile
    const user = await User.findById(req.user._id);

    // Handle Profile Picture upload if provided
    let profilePictureUrl = user.profilePicture;
    if (req.file) {
      const isCloudinaryActive = process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME.includes('mock_');
      
      if (isCloudinaryActive) {
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'medicare/profiles',
          });
          profilePictureUrl = result.secure_url;
          // Delete local file after upload
          fs.unlinkSync(req.file.path);
        } catch (uploadError) {
          console.error('Cloudinary upload failure, using local file:', uploadError);
          profilePictureUrl = `/uploads/${req.file.filename}`;
        }
      } else {
        // Fallback to local path
        profilePictureUrl = `/uploads/${req.file.filename}`;
      }
    }

    // Update user profile fields
    if (name) user.name = name;
    user.profilePicture = profilePictureUrl;
    await user.save();

    // Update patient profile fields
    patient.gender = gender !== undefined ? gender : patient.gender;
    patient.dateOfBirth = dateOfBirth !== undefined ? dateOfBirth : patient.dateOfBirth;
    patient.bloodGroup = bloodGroup !== undefined ? bloodGroup : patient.bloodGroup;
    patient.phone = phone !== undefined ? phone : patient.phone;

    if (address) {
      const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
      patient.address = { ...patient.address, ...parsedAddress };
    }

    if (emergencyContact) {
      const parsedContact = typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact;
      patient.emergencyContact = { ...patient.emergencyContact, ...parsedContact };
    }

    if (medicalHistory) {
      patient.medicalHistory = typeof medicalHistory === 'string' ? JSON.parse(medicalHistory) : medicalHistory;
    }

    await patient.save();

    const updatedProfile = await Patient.findOne({ user: req.user._id }).populate('user', 'name email role profilePicture');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient appointments
// @route   GET /api/patients/appointments
// @access  Private (Patient only)
const getPatientAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate('doctor', 'name email profilePicture')
      .populate({
        path: 'doctor',
        populate: { path: 'doctorDetails', select: 'specialization hospital' }
      })
      .populate('prescription')
      .sort('-date');

    // Mongoose populate query fallback
    // Since Doctor details is nested, we'll manually fetch details if populate nested fails
    const populatedAppointments = await Promise.all(
      appointments.map(async (appt) => {
        const apptObj = appt.toObject();
        // Look up the Doctor profile of the doctor User
        const Doctor = require('../models/Doctor');
        const doctorProfile = await Doctor.findOne({ user: appt.doctor._id });
        if (doctorProfile && apptObj.doctor) {
          apptObj.doctor.specialization = doctorProfile.specialization;
          apptObj.doctor.hospital = doctorProfile.hospital;
        }
        return apptObj;
      })
    );

    res.status(200).json({
      success: true,
      data: populatedAppointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite doctor
// @route   POST /api/patients/favorites
// @access  Private (Patient only)
const toggleFavoriteDoctor = async (req, res, next) => {
  const { doctorId } = req.body;

  try {
    let patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      patient = await Patient.create({ user: req.user._id });
    }

    const index = patient.favoriteDoctors.indexOf(doctorId);
    let message = '';
    
    if (index === -1) {
      patient.favoriteDoctors.push(doctorId);
      message = 'Doctor added to favorites';
    } else {
      patient.favoriteDoctors.splice(index, 1);
      message = 'Doctor removed from favorites';
    }

    await patient.save();

    res.status(200).json({
      success: true,
      message,
      favoriteDoctors: patient.favoriteDoctors,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getPatientAppointments,
  toggleFavoriteDoctor,
};
