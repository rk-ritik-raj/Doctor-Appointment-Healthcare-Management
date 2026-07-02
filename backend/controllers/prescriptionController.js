const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = async (req, res, next) => {
  const { appointmentId, diagnosis, medicines, advice } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify requesting doctor matches the appointment doctor
    if (appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to write prescription for this appointment' });
    }

    // Create prescription
    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: req.user._id,
      diagnosis,
      medicines,
      advice,
    });

    // Update appointment status to completed and link prescription
    appointment.status = 'completed';
    appointment.prescription = prescription._id;
    await appointment.save();

    // Create in-app notification for the patient
    await Notification.create({
      user: appointment.patient,
      title: 'New Prescription Available',
      message: `Dr. ${req.user.name} uploaded a prescription for your appointment on ${new Date(appointment.date).toLocaleDateString()}.`,
      type: 'system',
    });

    res.status(201).json({
      success: true,
      message: 'Prescription generated successfully',
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private (Patient / Doctor)
const getPrescriptionById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const prescription = await Prescription.findById(id)
      .populate('patient', 'name email profilePicture')
      .populate('doctor', 'name email profilePicture')
      .populate({
        path: 'doctor',
        populate: { path: 'doctorDetails', select: 'specialization hospital' },
      });

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Validate ownership
    const isPatient = req.user._id.toString() === prescription.patient._id.toString();
    const isDoctor = req.user._id.toString() === prescription.doctor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this prescription' });
    }

    // Fallback nested populate manual fetch
    const presObj = prescription.toObject();
    const DoctorModel = require('../models/Doctor');
    const doctorProfile = await DoctorModel.findOne({ user: prescription.doctor._id });
    if (doctorProfile && presObj.doctor) {
      presObj.doctor.specialization = doctorProfile.specialization;
      presObj.doctor.hospital = doctorProfile.hospital;
    }

    res.status(200).json({
      success: true,
      data: presObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription for an appointment
// @route   GET /api/prescriptions/appointment/:id
// @access  Private
const getPrescriptionByAppointment = async (req, res, next) => {
  const { id } = req.params;

  try {
    const prescription = await Prescription.findOne({ appointment: id })
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'No prescription found for this appointment' });
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPrescription,
  getPrescriptionById,
  getPrescriptionByAppointment,
};
