/**
 * Realistic sample data for the G Fit app.
 * FLAGGED items show locked/CTA states — no fake values fabricated.
 */

import { Colors } from './theme';

export const user = {
  name: 'Panna',
  condition: 'PCOS/PCOD',
  avatar: null, // Will use initials avatar
  streakDays: 12,
  rewardCoins: 0, // FLAGGED: reward system not yet built
  isPremium: false, // Whether user has premium membership
};

export const coach = {
  name: 'Geetanjali',
  title: 'Certified Yoga & Fitness Coach',
  experience: '12+ years',
  certifications: 'K11 Fitness, Yoga YIC',
  avatar: null,
};

export const testimonials = [
  {
    id: '1',
    name: 'Priya Deshmukh',
    avatar: null,
    quote: 'Geetanjali completely changed my approach to fitness. Her warmth and expert guidance are truly unmatched.',
    rating: 5,
    transformation: 'Lost 12 kg in 6 months',
    duration: '6 months',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require('../assets/transformations/transform1.png'),
  },
  {
    id: '2',
    name: 'Sneha Kulkarni',
    avatar: null,
    quote: 'Joining the online yoga classes was the best decision for my postnatal recovery. I feel stronger every day.',
    rating: 5,
    transformation: 'Postnatal recovery in 4 months',
    duration: '4 months',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require('../assets/transformations/transform3.png'),
  },
  {
    id: '3',
    name: 'Rupal Vyas',
    avatar: null,
    quote: 'A great place to focus on both physical fitness and mental well-being. The environment is positive and motivating.',
    rating: 5,
    transformation: 'Gained flexibility & strength',
    duration: '8 months',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require('../assets/transformations/transform2.png'),
  },
  {
    id: '4',
    name: 'Kunal Bagul',
    avatar: null,
    quote: 'Their online yoga sessions are fantastic — it feels like the trainer is right there with you in the room.',
    rating: 5,
    transformation: 'Lost 8 kg & improved posture',
    duration: '5 months',
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    image: require('../assets/transformations/transform2.png'),
  },
];

export const upcomingSessions = [
  {
    id: '1',
    mentorName: 'Geetanjali',
    time: '7:00 AM',
    duration: '45 min',
    date: 'Today',
    condition: 'PCOS/PCOD',
    spotsJoined: 6,
    spotsTotal: 10,
    isLive: false,
    canJoin: true,
  },
  {
    id: '2',
    mentorName: 'Geetanjali',
    time: '6:00 PM',
    duration: '30 min',
    date: 'Today',
    condition: 'Weight Management',
    spotsJoined: 8,
    spotsTotal: 10,
    isLive: false,
    canJoin: false,
  },
  {
    id: '3',
    mentorName: 'Geetanjali',
    time: '7:00 AM',
    duration: '45 min',
    date: 'Tomorrow',
    condition: 'PCOS/PCOD',
    spotsJoined: 4,
    spotsTotal: 10,
    isLive: false,
    canJoin: false,
  },
];

export const liveSessions = [
  {
    id: 'live-1',
    mentorName: 'Geetanjali',
    time: '7:00 AM',
    duration: '45 min',
    date: 'Now',
    condition: 'Morning Yoga Flow',
    spotsJoined: 7,
    spotsTotal: 10,
    isLive: true,
    canJoin: true,
  },
];

export const pastSessions = [
  {
    id: 'past-1',
    mentorName: 'Geetanjali',
    date: 'Aug 31, 2026',
    condition: 'PCOS/PCOD',
    status: 'Completed',
  },
  {
    id: 'past-2',
    mentorName: 'Geetanjali',
    date: 'Aug 30, 2026',
    condition: 'PCOS/PCOD',
    status: 'Completed',
  },
  {
    id: 'past-3',
    mentorName: 'Geetanjali',
    date: 'Aug 29, 2026',
    condition: 'Morning Yoga',
    status: 'Missed',
  },
  {
    id: 'past-4',
    mentorName: 'Geetanjali',
    date: 'Aug 28, 2026',
    condition: 'PCOS/PCOD',
    status: 'Completed',
  },
];

export const weightData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [{ data: [68.5, 68.2, 68.0, 67.8, 67.5, 67.3, 67.0] }],
};

export const activityData = {
  labels: ['Yoga', 'Cardio', 'Walk', 'Cycle', 'Swim'],
  data: [0.8, 0.5, 0.6, 0.3, 0.1],
};

export const badges = [
  { id: '1', title: '7-Day Streak', description: 'Complete 7 consecutive daily sessions', icon: 'flame-outline', earned: true, date: 'Aug 20, 2026', linkedChallenge: null },
  { id: '2', title: '15-Day Sugar Detox', description: 'Successfully complete the 15-day dietary challenge', icon: 'nutrition-outline', earned: true, date: 'Jul 15, 2026', linkedChallenge: 'sugar-detox' },
  { id: '3', title: 'Early Bird', description: 'Attend 10 morning sessions before 8 AM', icon: 'sunny-outline', earned: true, date: 'Aug 05, 2026', linkedChallenge: null },
  { id: '4', title: '30-Day Warrior', description: 'Complete 30 consecutive daily sessions', icon: 'trophy-outline', earned: false, linkedChallenge: '30-day-warrior' },
  { id: '5', title: 'Flexibility Master', description: 'Reach level 5 in the flexibility assessment', icon: 'body-outline', earned: false, linkedChallenge: 'flexibility-challenge' },
  { id: '6', title: 'Community Star', description: 'Receive 50 likes on a single community post', icon: 'star-outline', earned: false, linkedChallenge: null },
];

export const activityLog = [
  { id: 'al-1', type: 'Yoga', duration: '45 min', date: 'Today', icon: 'body-outline', color: Colors.primaryTeal },
  { id: 'al-2', type: 'Walking', duration: '30 min', date: 'Yesterday', icon: 'walk-outline', color: Colors.accentLime },
  { id: 'al-3', type: 'Yoga', duration: '60 min', date: 'Sep 1, 2026', icon: 'body-outline', color: Colors.primaryTeal },
  { id: 'al-4', type: 'Cycling', duration: '45 min', date: 'Aug 30, 2026', icon: 'bicycle-outline', color: '#F59E0B' },
  { id: 'al-5', type: 'Yoga', duration: '45 min', date: 'Aug 28, 2026', icon: 'body-outline', color: Colors.primaryTeal },
];

export const milestoneWall = [
  { id: 'mw-1', title: '100 Sessions Completed', date: 'Aug 25, 2026', description: 'A massive milestone representing true dedication to the journey.', type: 'milestone', verified: true },
  { id: 'mw-2', title: 'Reversed pre-diabetic marker', date: 'Aug 10, 2026', description: 'Blood tests confirmed blood sugar levels are back in the normal range.', type: 'health', verified: true },
  { id: 'mw-3', title: 'First 5K Walk', date: 'Jul 22, 2026', description: 'Completed a 5K walk without stopping for the first time.', type: 'activity', verified: false },
  { id: 'mw-4', title: 'Started the Journey', date: 'Jan 10, 2026', description: 'Joined G Fit and completed the first assessment.', type: 'milestone', verified: true },
];

export const weeklyChallenge = {
  id: 'sugar-detox',
  title: '15-Day Sugar Detox Challenge',
  description: 'Eliminate refined sugars from your diet for 15 days. Track your meals, stay hydrated, and discover how much better you feel without processed sugars.',
  daysLeft: 4,
  enrolled: 1254,
  isPremiumOnly: true,
  leaderboard: [
    { name: 'Sneha K.', score: 98, rank: 1 },
    { name: 'Priya D.', score: 95, rank: 2 },
    { name: 'Kunal B.', score: 92, rank: 3 },
    { name: 'Rupal V.', score: 88, rank: 4 },
    { name: 'Meera J.', score: 85, rank: 5 },
  ],
};

/* ────────── Updated Settings (new structure) ────────── */
export const settingsItems = [
  { id: 'reset-password', label: 'Reset Password', icon: 'lock-closed-outline', type: 'navigate' as const },
  { id: 'dark-mode', label: 'Dark Mode', icon: 'moon-outline', type: 'toggle' as const },
  { id: 'account-settings', label: 'Account Settings', icon: 'person-outline', type: 'navigate' as const },
  { id: 'push-notifications', label: 'Push Notifications', icon: 'notifications-outline', type: 'toggle' as const },
];

export const toolItems = [
  { id: 'progress', label: 'Progress & Insights', icon: 'analytics-outline' },
  { id: 'diet', label: 'Diet Tool', icon: 'restaurant-outline' },
  { id: 'training', label: 'Training Tool', icon: 'barbell-outline' },
  { id: 'bmr', label: 'BMR Calculator', icon: 'calculator-outline' },
];

export const legalItems = [
  { id: 'terms', label: 'Terms & Conditions' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'community', label: 'Community Guidelines' },
];

/* ────────── All 10 Activities with Custom Input Fields ────────── */
export interface ActivityInputField {
  key: string;
  label: string;
  placeholder: string;
  unit: string;
  keyboardType: 'numeric' | 'default';
}

export interface ActivityType {
  id: string;
  name: string;
  icon: string;
  color: string;
  inputFields: ActivityInputField[];
}

export const allActivities: ActivityType[] = [
  {
    id: 'yoga',
    name: 'Yoga',
    icon: 'body-outline',
    color: Colors.primaryTeal,
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '45', unit: 'min', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'weight-training',
    name: 'Weight Training',
    icon: 'barbell-outline',
    color: '#E53935',
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '60', unit: 'min', keyboardType: 'numeric' },
      { key: 'sets', label: 'Total Sets', placeholder: '12', unit: 'sets', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'walking',
    name: 'Walking',
    icon: 'walk-outline',
    color: Colors.accentLime,
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '30', unit: 'min', keyboardType: 'numeric' },
      { key: 'distance', label: 'Distance', placeholder: '3', unit: 'km', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'step-up-down',
    name: 'Step Up Down',
    icon: 'footsteps-outline',
    color: '#FF9800',
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '20', unit: 'min', keyboardType: 'numeric' },
      { key: 'steps', label: 'Steps', placeholder: '500', unit: 'steps', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'running',
    name: 'Running',
    icon: 'speedometer-outline',
    color: '#1E88E5',
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '30', unit: 'min', keyboardType: 'numeric' },
      { key: 'distance', label: 'Distance', placeholder: '5', unit: 'km', keyboardType: 'numeric' },
      { key: 'pace', label: 'Avg Pace', placeholder: '6', unit: 'min/km', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'crossfit',
    name: 'CrossFit',
    icon: 'fitness-outline',
    color: '#7B1FA2',
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '45', unit: 'min', keyboardType: 'numeric' },
      { key: 'rounds', label: 'Rounds', placeholder: '5', unit: 'rounds', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'bodyweight',
    name: 'Body Weight Exercise',
    icon: 'accessibility-outline',
    color: '#00897B',
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '30', unit: 'min', keyboardType: 'numeric' },
      { key: 'reps', label: 'Total Reps', placeholder: '100', unit: 'reps', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'hike',
    name: 'Hike',
    icon: 'trail-sign-outline',
    color: '#558B2F',
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '120', unit: 'min', keyboardType: 'numeric' },
      { key: 'distance', label: 'Distance', placeholder: '8', unit: 'km', keyboardType: 'numeric' },
      { key: 'elevation', label: 'Elevation Gain', placeholder: '300', unit: 'm', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'cycling',
    name: 'Cycling',
    icon: 'bicycle-outline',
    color: '#F59E0B',
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '45', unit: 'min', keyboardType: 'numeric' },
      { key: 'distance', label: 'Distance', placeholder: '15', unit: 'km', keyboardType: 'numeric' },
    ],
  },
  {
    id: 'swim',
    name: 'Swim',
    icon: 'water-outline',
    color: '#039BE5',
    inputFields: [
      { key: 'duration', label: 'Duration', placeholder: '30', unit: 'min', keyboardType: 'numeric' },
      { key: 'laps', label: 'Laps', placeholder: '20', unit: 'laps', keyboardType: 'numeric' },
    ],
  },
];
