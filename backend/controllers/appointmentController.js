const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Book an appointment
// @route   POST /api/appointments/book
// @access  Private (Patient only)
const bookAppointment = async (req, res, next) => {
  const { doctorId, date, timeSlot } = req.body;

  try {
    // Check if doctor exists
    const doctorUser = await User.findById(doctorId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const doctorProfile = await Doctor.findOne({ user: doctorId });
    if (!doctorProfile) {
      return res.status(404).json({ success: false, message: 'Doctor details not found' });
    }

    // Standardize booking date (strip time)
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    // Check slot collision (is slot already booked?)
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: bookingDate,
      timeSlot: timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please select another slot or day.',
      });
    }

    // Create the appointment (initially pending payment or approval)
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctorId,
      date: bookingDate,
      timeSlot: timeSlot,
      status: 'pending',
      amountPaid: doctorProfile.consultationFee,
    });

    // Send in-app notification to the Doctor
    await Notification.create({
      user: doctorId,
      title: 'New Appointment Request',
      message: `Patient ${req.user.name} requested an appointment on ${bookingDate.toLocaleDateString()} at ${timeSlot}.`,
      type: 'appointment',
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Awaiting payment/approval.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Approve, Complete, Cancel, Reschedule)
// @route   PUT /api/appointments/:id/status
// @access  Private (Auth users)
const updateAppointmentStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, date, timeSlot } = req.body;

  try {
    const appointment = await Appointment.findById(id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify ownership/role permission
    const isPatient = req.user._id.toString() === appointment.patient._id.toString();
    const isDoctor = req.user._id.toString() === appointment.doctor._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
    }

    // Handle rescheduling
    if (date && timeSlot) {
      // Validate slot availability
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);

      const collision = await Appointment.findOne({
        _id: { $ne: id },
        doctor: appointment.doctor._id,
        date: targetDate,
        timeSlot: timeSlot,
        status: { $ne: 'cancelled' },
      });

      if (collision) {
        return res.status(400).json({
          success: false,
          message: 'The requested slot is already booked.',
        });
      }

      appointment.date = targetDate;
      appointment.timeSlot = timeSlot;
      appointment.status = 'pending'; // Reset approval after rescheduling

      // Notify other party
      const notifyUserId = isPatient ? appointment.doctor._id : appointment.patient._id;
      await Notification.create({
        user: notifyUserId,
        title: 'Appointment Rescheduled',
        message: `Appointment rescheduled to ${targetDate.toLocaleDateString()} at ${timeSlot} by ${req.user.name}.`,
        type: 'appointment',
      });
    }

    // Handle status updates
    if (status) {
      // Patients can only cancel their appointments
      if (isPatient && status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Patients can only cancel appointments' });
      }

      appointment.status = status;

      // Create notification for state change
      const targetUser = isPatient ? appointment.doctor._id : appointment.patient._id;
      await Notification.create({
        user: targetUser,
        title: `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your appointment on ${appointment.date.toLocaleDateString()} is now ${status}.`,
        type: 'appointment',
      });
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  updateAppointmentStatus,
};
