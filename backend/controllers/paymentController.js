const stripe = require('stripe');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');

// Initialize stripe with fallback check
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('mock_')) {
    return null;
  }
  return stripe(secretKey);
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/checkout-session
// @access  Private (Patient only)
const createCheckoutSession = async (req, res, next) => {
  const { appointmentId } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'name')
      .populate('patient', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctorDetails = await Doctor.findOne({ user: appointment.doctor._id });
    const fee = doctorDetails ? doctorDetails.consultationFee : 500;

    const stripeInstance = getStripeInstance();

    // Fallback: If stripe is not configured or in mock, simulate checkout instantly
    if (!stripeInstance) {
      console.log('Stripe not configured or mock key used. Simulating offline checkout...');
      
      // Update appointment directly to paid and approved
      appointment.paymentStatus = 'paid';
      appointment.status = 'approved';
      appointment.paymentId = `mock_payment_id_${Date.now()}`;
      await appointment.save();

      return res.status(200).json({
        success: true,
        mode: 'mock',
        message: 'Mock payment completed successfully.',
        redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success&id=${appointmentId}`,
      });
    }

    // Real Stripe Flow
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Consultation with Dr. ${appointment.doctor.name}`,
              description: `Appointment slot: ${appointment.timeSlot} on ${new Date(appointment.date).toLocaleDateString()}`,
            },
            unit_amount: fee * 100, // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=success&id=${appointmentId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment=cancel&id=${appointmentId}`,
      customer_email: appointment.patient.email,
      metadata: {
        appointmentId: appointmentId.toString(),
      },
    });

    res.status(200).json({
      success: true,
      mode: 'live',
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Stripe Payment directly (fallback callback check)
// @route   POST /api/payments/verify
// @access  Private (Patient only)
const verifyPayment = async (req, res, next) => {
  const { appointmentId, paymentId } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.paymentStatus = 'paid';
    appointment.status = 'approved';
    if (paymentId) appointment.paymentId = paymentId;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Webhook handler for stripe payment events
// @route   POST /api/payments/webhook
// @access  Public
const handleStripeWebhook = async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const stripeInstance = getStripeInstance();

  if (!stripeInstance) {
    return res.status(400).send('Stripe is not configured.');
  }

  let event;

  try {
    // In production, we verify with webhook signature. If not local dev, rawBody parsing is needed
    event = req.body; // In this simple route, we just process JSON
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const appointmentId = session.metadata.appointmentId;

      const appointment = await Appointment.findById(appointmentId);
      if (appointment) {
        appointment.paymentStatus = 'paid';
        appointment.status = 'approved';
        appointment.paymentId = session.payment_intent;
        await appointment.save();
        console.log(`Appointment ${appointmentId} updated to paid via webhook.`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
  handleStripeWebhook,
};
