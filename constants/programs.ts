/**
 * Static data for the 15 condition-based programs.
 * Icons reference Ionicons names from @expo/vector-icons.
 */

export interface Program {
  id: string;
  title: string;
  shortTitle: string;
  icon: string; // Ionicons name
  description: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
}

export const programs: Program[] = [
  {
    id: 'type-2-diabetes',
    title: 'Type 2 Diabetes & Pre-Diabetes',
    shortTitle: 'Diabetes',
    icon: 'water-outline',
    description: 'Manage blood sugar naturally with yoga, diet & lifestyle coaching.',
    benefits: [
      'Personalized yoga sequences targeting insulin sensitivity',
      'Blood sugar–friendly nutrition plan with Indian meal options',
      'Weekly mentor check-ins to track HbA1c progress',
    ],
    faqs: [
      { question: 'Can yoga actually lower blood sugar?', answer: 'Yes — studies show specific asanas improve insulin sensitivity. Our program combines these with pranayama and diet adjustments for measurable results.' },
      { question: 'Do I need to stop my medication?', answer: 'Absolutely not. Our program complements medical treatment. Always consult your doctor before making medication changes.' },
    ],
  },
  {
    id: 'hypertension',
    title: 'Hypertension (Blood Pressure)',
    shortTitle: 'Blood Pressure',
    icon: 'heart-outline',
    description: 'Lower BP through targeted breathing, movement & stress management.',
    benefits: [
      'Pranayama-focused sessions proven to reduce systolic pressure',
      'Stress-reduction techniques for daily practice',
      'Heart-healthy meal planning guidance',
    ],
    faqs: [
      { question: 'Is intense exercise safe with high BP?', answer: 'Our program focuses on gentle, restorative movements and breathing — no high-intensity work that could spike your BP.' },
    ],
  },
  {
    id: 'thyroid',
    title: 'Thyroid (Hypo & Hyper / Hashimoto\'s)',
    shortTitle: 'Thyroid',
    icon: 'body-outline',
    description: 'Balance thyroid function with targeted asanas & nutrition.',
    benefits: [
      'Throat-opening asanas that stimulate the thyroid gland',
      'Anti-inflammatory nutrition plan',
      'Stress management to reduce autoimmune flares',
    ],
    faqs: [
      { question: 'How long before I see improvement?', answer: 'Most clients notice energy and weight changes within 4–6 weeks with consistent practice and dietary adjustments.' },
    ],
  },
  {
    id: 'pcos-pcod',
    title: 'PCOS/PCOD',
    shortTitle: 'PCOS/PCOD',
    icon: 'female-outline',
    description: 'Hormone-balancing yoga, nutrition & lifestyle strategies for PCOS.',
    benefits: [
      'Hormone-balancing yoga sequences',
      'PCOS-specific diet plan addressing insulin resistance',
      'Cycle-syncing workout guidance',
    ],
    faqs: [
      { question: 'Can yoga help with irregular periods?', answer: 'Yes — our targeted sequences help regulate hormonal balance. Many clients see cycle improvements within 2–3 months.' },
    ],
  },
  {
    id: 'weight-management',
    title: 'Weight Management',
    shortTitle: 'Weight Loss',
    icon: 'scale-outline',
    description: 'Sustainable fat loss through movement, mindset & smart nutrition.',
    benefits: [
      'Progressive workout plans (yoga + cardio mix)',
      'Calorie-conscious Indian meal plans — no crash diets',
      'Weekly weigh-ins with mentor accountability',
    ],
    faqs: [
      { question: 'How is this different from a gym program?', answer: 'We focus on sustainable lifestyle change, not just exercise. You get nutrition, mindset coaching, and mentor support alongside movement.' },
    ],
  },
  {
    id: 'cholesterol-heart',
    title: 'Cholesterol & Heart Health',
    shortTitle: 'Heart Health',
    icon: 'fitness-outline',
    description: 'Improve lipid profile with movement, diet & stress control.',
    benefits: [
      'Cardio-safe exercise routines',
      'Heart-healthy dietary framework',
      'Stress-reduction techniques for cardiovascular health',
    ],
    faqs: [
      { question: 'Can yoga reduce cholesterol?', answer: 'Combined with the right diet, yoga helps reduce LDL and triglycerides while improving HDL levels over time.' },
    ],
  },
  {
    id: 'fatty-liver',
    title: 'Fatty Liver',
    shortTitle: 'Fatty Liver',
    icon: 'leaf-outline',
    description: 'Reverse fatty liver with targeted detox movement & nutrition.',
    benefits: [
      'Liver-supporting yoga twists and stretches',
      'Detox-friendly nutrition without extreme fasting',
      'Progress tracking via liver function markers',
    ],
    faqs: [
      { question: 'Can fatty liver be reversed?', answer: 'In many cases, yes — with the right diet and exercise routine, liver fat can be significantly reduced within 3–6 months.' },
    ],
  },
  {
    id: 'ckd',
    title: 'Chronic Kidney Disease (CKD)',
    shortTitle: 'Kidney Health',
    icon: 'medical-outline',
    description: 'Gentle movement & kidney-friendly nutrition guidance.',
    benefits: [
      'Low-impact exercises safe for CKD patients',
      'Renal-friendly meal planning',
      'Blood pressure and hydration management support',
    ],
    faqs: [
      { question: 'Is exercise safe with CKD?', answer: 'Gentle, guided exercise is recommended for CKD. Our program is designed to be safe and beneficial — always in coordination with your nephrologist.' },
    ],
  },
  {
    id: 'varicose-veins',
    title: 'Varicose Veins',
    shortTitle: 'Varicose Veins',
    icon: 'walk-outline',
    description: 'Improve circulation with targeted leg exercises & elevation routines.',
    benefits: [
      'Circulation-boosting leg exercises',
      'Elevation and compression guidance',
      'Anti-inflammatory diet suggestions',
    ],
    faqs: [
      { question: 'Should I avoid certain yoga poses?', answer: 'Yes — we customize your practice to avoid poses that worsen venous pressure while focusing on those that improve circulation.' },
    ],
  },
  {
    id: 'musculoskeletal',
    title: 'Musculoskeletal Conditions',
    shortTitle: 'Joint & Spine',
    icon: 'accessibility-outline',
    description: 'Relieve joint pain & back issues with corrective movement.',
    benefits: [
      'Pain-relief focused yoga therapy',
      'Posture correction and strengthening',
      'Safe mobility restoration exercises',
    ],
    faqs: [
      { question: 'I have a herniated disc — is yoga safe?', answer: 'Yes, with the right modifications. Geetanjali tailors every session to your specific condition and pain level.' },
    ],
  },
  {
    id: 'gut-health',
    title: 'Gut Health & Digestive Issues',
    shortTitle: 'Gut Health',
    icon: 'nutrition-outline',
    description: 'Heal your gut with movement, pranayama & anti-inflammatory eating.',
    benefits: [
      'Digestion-stimulating yoga sequences',
      'Gut-healing nutrition framework',
      'Stress-gut axis management through pranayama',
    ],
    faqs: [
      { question: 'Can yoga help with IBS?', answer: 'Many IBS symptoms respond well to stress reduction and gut-directed yoga. Our program addresses both physical and nervous system aspects.' },
    ],
  },
  {
    id: 'hormonal-imbalances',
    title: 'Hormonal Imbalances',
    shortTitle: 'Hormones',
    icon: 'pulse-outline',
    description: 'Restore hormonal balance through movement, nutrition & lifestyle.',
    benefits: [
      'Endocrine-supporting yoga practices',
      'Hormone-balancing nutrition plan',
      'Sleep and circadian rhythm optimization',
    ],
    faqs: [
      { question: 'Is this only for women?', answer: 'No — we address hormonal imbalances in both men and women, including thyroid, cortisol, testosterone, and more.' },
    ],
  },
  {
    id: 'autoimmune',
    title: 'Autoimmune Conditions',
    shortTitle: 'Autoimmune',
    icon: 'shield-outline',
    description: 'Manage autoimmune symptoms with gentle movement & anti-inflammatory nutrition.',
    benefits: [
      'Gentle, flare-sensitive exercise programming',
      'Anti-inflammatory meal planning',
      'Stress and immune system management',
    ],
    faqs: [
      { question: 'Will exercise make my flares worse?', answer: 'Our program is specifically designed for autoimmune conditions — we adjust intensity based on your current symptom level.' },
    ],
  },
  {
    id: 'senior-fitness',
    title: 'Geriatric/Senior Fitness (55+)',
    shortTitle: 'Senior Fitness',
    icon: 'people-outline',
    description: 'Safe, effective fitness for seniors — mobility, balance & strength.',
    benefits: [
      'Fall-prevention balance training',
      'Joint-safe strength maintenance',
      'Social connection through group sessions',
    ],
    faqs: [
      { question: 'I\'ve never exercised before — can I start at 60?', answer: 'Absolutely! Our senior program starts from your current level and builds gradually. Many of our happiest clients started in their 60s.' },
    ],
  },
  {
    id: 'stress-sleep-mental',
    title: 'Stress, Sleep & Mental Wellness',
    shortTitle: 'Mental Wellness',
    icon: 'moon-outline',
    description: 'Restore calm, improve sleep & build mental resilience.',
    benefits: [
      'Deep relaxation and yoga nidra practices',
      'Sleep hygiene coaching and bedtime routines',
      'Anxiety and stress management techniques',
    ],
    faqs: [
      { question: 'How quickly can yoga help with sleep?', answer: 'Many clients report improved sleep quality within the first 1–2 weeks of regular evening practice and sleep hygiene adjustments.' },
    ],
  },
];
