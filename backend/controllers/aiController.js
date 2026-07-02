const Doctor = require('../models/Doctor');

// @desc    Analyze symptoms and recommend medical specializations
// @route   POST /api/ai/symptom-check
// @access  Public
const analyzeSymptoms = async (req, res, next) => {
  const { symptoms } = req.body;

  if (!symptoms || symptoms.trim() === '') {
    return res.status(400).json({ success: false, message: 'Please provide symptom details.' });
  }

  try {
    const text = symptoms.toLowerCase();
    let recommendedSpecialization = 'General Physician';
    let likelihood = 'Moderate';
    let explanation = '';
    let recommendations = [];

    // Symptom-to-Specialization Decision Rules
    if (text.includes('chest pain') || text.includes('palpitations') || text.includes('breathless') || text.includes('heartbeat')) {
      recommendedSpecialization = 'Cardiologist';
      likelihood = 'High';
      explanation = 'Your symptoms suggest potential cardiovascular strain or heart health issues.';
      recommendations = [
        'Seek urgent medical attention if chest pain spreads to the jaw, neck, or arm.',
        'Avoid strenuous physical exertion and sit in an upright, relaxed position.',
        'Have your blood pressure and heart rate monitored.',
      ];
    } else if (text.includes('skin') || text.includes('rash') || text.includes('acne') || text.includes('eczema') || text.includes('itch')) {
      recommendedSpecialization = 'Dermatologist';
      likelihood = 'High';
      explanation = 'Skin lesions, rashes, and persistent itchiness point to dermatological issues or allergic contact dermatitis.';
      recommendations = [
        'Do not scratch the affected skin to prevent secondary bacterial infections.',
        'Wash the area with cool water and mild soap.',
        'Avoid applying harsh chemicals, perfumes, or makeup on the irritation.',
      ];
    } else if (text.includes('tooth') || text.includes('teeth') || text.includes('gum') || text.includes('dental') || text.includes('cavity')) {
      recommendedSpecialization = 'Dentist';
      likelihood = 'High';
      explanation = 'Localized oral pain or bleeding gums indicate tooth decay or gingivitis requiring dental treatment.';
      recommendations = [
        'Rinse your mouth with warm salt water.',
        'Avoid eating extremely hot, cold, or sugary foods.',
        'Take mild over-the-counter pain relievers if appropriate.',
      ];
    } else if (text.includes('headache') || text.includes('migraine') || text.includes('numbness') || text.includes('seizure') || text.includes('dizzy')) {
      recommendedSpecialization = 'Neurologist';
      likelihood = 'Moderate';
      explanation = 'Neurological symptoms like severe headaches, dizziness, or localized numbness should be checked for nerve issues.';
      recommendations = [
        'Rest in a dark, quiet, well-ventilated room.',
        'Ensure you stay hydrated and trace the trigger of your headache.',
        'Monitor for signs of sensory loss or motor impairment.',
      ];
    } else if (text.includes('joint') || text.includes('bone') || text.includes('fracture') || text.includes('knee pain') || text.includes('back pain')) {
      recommendedSpecialization = 'Orthopedic';
      likelihood = 'High';
      explanation = 'Skeletal aches, joint inflammation, or injuries correspond to musculoskeletal disorders.';
      recommendations = [
        'Apply the R.I.C.E. method (Rest, Ice, Compression, Elevation) to acute joint injuries.',
        'Avoid weight-bearing on the painful limb.',
        'Use supportive brace wraps if available.',
      ];
    } else if (text.includes('pregnancy') || text.includes('period') || text.includes('cramp') || text.includes('menstrual') || text.includes('female')) {
      recommendedSpecialization = 'Gynecologist';
      likelihood = 'High';
      explanation = 'Uterine cramps, irregular menstrual cycles, or prenatal consultation requests relate to gynecological wellness.';
      recommendations = [
        'Apply a warm heating pad to your lower abdomen to relieve cramps.',
        'Track the first day of your last cycle.',
        'Stay well-hydrated and rest.',
      ];
    } else if (text.includes('child') || text.includes('baby') || text.includes('pediatric') || text.includes('infant')) {
      recommendedSpecialization = 'Pediatrician';
      likelihood = 'High';
      explanation = 'Health checkups and illnesses in infants and children require specialized pediatric evaluation.';
      recommendations = [
        'Monitor the child\'s temperature hourly.',
        'Ensure fluid intake is maintained (milk, electrolyte solution).',
        'Seek immediate care if the child is unusually lethargic.',
      ];
    } else if (text.includes('ear') || text.includes('nose') || text.includes('throat') || text.includes('sinus') || text.includes('tonsil')) {
      recommendedSpecialization = 'ENT';
      likelihood = 'High';
      explanation = 'Throat soreness, nasal congestion, or ear aches indicate infections of the upper respiratory tract.';
      recommendations = [
        'Gargle with warm salt water twice daily.',
        'Use steam inhalation to relieve nasal and sinus congestion.',
        'Drink warm fluids like tea with honey.',
      ];
    } else if (text.includes('depressed') || text.includes('anxiety') || text.includes('insomnia') || text.includes('panic') || text.includes('stress')) {
      recommendedSpecialization = 'Psychiatrist';
      likelihood = 'High';
      explanation = 'Severe mood disturbances, sleep deprivation, or panic episodes align with mental health clinical needs.';
      recommendations = [
        'Practice deep, slow diaphragmatic breathing.',
        'Avoid caffeine, alcohol, and screen usage before bedtime.',
        'Talk to a trusted friend or reach out to support hotlines if in distress.',
      ];
    } else {
      // General Physician Fallback
      explanation = 'Based on the described symptoms, a general physical exam is recommended to isolate the cause.';
      recommendations = [
        'Monitor symptoms and check for a fever.',
        'Ensure you get 8 hours of sleep and drink adequate fluids.',
        'Book a consultation with a General Physician for checkup.',
      ];
    }

    // Fetch up to 3 approved doctors matching the recommended specialization
    const matchingDoctors = await Doctor.find({
      specialization: recommendedSpecialization,
      isApproved: 'approved',
    })
      .populate('user', 'name profilePicture')
      .limit(3);

    res.status(200).json({
      success: true,
      data: {
        symptoms,
        recommendedSpecialization,
        likelihood,
        explanation,
        recommendations,
        doctors: matchingDoctors,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeSymptoms,
};
