/**
 * Community Feed mock data - social-media-style posts
 * for the G Fit community section.
 */

export interface CommunityComment {
  id: string;
  userName: string;
  text: string;
  timeAgo: string;
}

export interface CommunityPostData {
  id: string;
  userName: string;
  timeAgo: string;
  content: string;
  tag: 'Achievement' | 'Transformation' | 'Recipe' | 'Motivation' | 'Milestone';
  likes: number;
  comments: CommunityComment[];
  shares: number;
  isLiked: boolean;
}

export const communityPosts: CommunityPostData[] = [
  {
    id: 'cp-1',
    userName: 'Sneha Kulkarni',
    timeAgo: '2h ago',
    content:
      'Just completed my 30-day yoga streak! Never thought I could stay this consistent. Feeling stronger, calmer, and more flexible than ever. Thank you Geetanjali maam for the daily motivation!',
    tag: 'Achievement',
    likes: 47,
    comments: [
      {
        id: 'cc-1',
        userName: 'Rupal Vyas',
        text: 'Amazing consistency Sneha! You inspire me every day',
        timeAgo: '1h ago',
      },
      {
        id: 'cc-2',
        userName: 'Kunal Bagul',
        text: 'Incredible discipline! Keep crushing it',
        timeAgo: '45m ago',
      },
    ],
    shares: 5,
    isLiked: false,
  },
  {
    id: 'cp-2',
    userName: 'Priya Deshmukh',
    timeAgo: '5h ago',
    content:
      'My 6-month transformation! From struggling to touch my toes to doing full splits. PCOS management through yoga has been a game-changer. Down 12 kg and feeling like a new person!',
    tag: 'Transformation',
    likes: 124,
    comments: [
      {
        id: 'cc-3',
        userName: 'Sneha Kulkarni',
        text: 'This is SO inspiring Priya! You look fantastic!',
        timeAgo: '4h ago',
      },
      {
        id: 'cc-4',
        userName: 'Meera Joshi',
        text: 'Can you share your routine? I just started my PCOS journey too',
        timeAgo: '3h ago',
      },
    ],
    shares: 18,
    isLiked: true,
  },
  {
    id: 'cp-3',
    userName: 'Kunal Bagul',
    timeAgo: '8h ago',
    content:
      'Post-workout smoothie recipe that keeps me going!\n\n- 1 banana\n- Handful of spinach\n- 1 scoop protein powder\n- Almond milk\n- Chia seeds\n\nBlend and enjoy! Perfect after the morning session',
    tag: 'Recipe',
    likes: 38,
    comments: [
      {
        id: 'cc-5',
        userName: 'Priya Deshmukh',
        text: 'Trying this tomorrow! Love adding chia seeds',
        timeAgo: '7h ago',
      },
    ],
    shares: 12,
    isLiked: false,
  },
  {
    id: 'cp-4',
    userName: 'Rupal Vyas',
    timeAgo: '1d ago',
    content:
      'Small wins matter! Today I held my plank for 2 full minutes. Three months ago, I couldn\'t even last 15 seconds. Progress isn\'t always visible, but it\'s always happening. Keep showing up!',
    tag: 'Motivation',
    likes: 89,
    comments: [
      {
        id: 'cc-6',
        userName: 'Sneha Kulkarni',
        text: 'Yes queen! 2 minutes is incredible!!',
        timeAgo: '20h ago',
      },
      {
        id: 'cc-7',
        userName: 'Kunal Bagul',
        text: 'This is what it\'s all about. Slow and steady progress',
        timeAgo: '18h ago',
      },
    ],
    shares: 7,
    isLiked: true,
  },
  {
    id: 'cp-5',
    userName: 'Meera Joshi',
    timeAgo: '1d ago',
    content:
      '100 sessions completed on G Fit! What a milestone. From my first nervous online class to now looking forward to every single session. This community is everything!',
    tag: 'Milestone',
    likes: 156,
    comments: [
      {
        id: 'cc-8',
        userName: 'Rupal Vyas',
        text: 'Congratulations Meera! 100 sessions is HUGE!',
        timeAgo: '22h ago',
      },
    ],
    shares: 9,
    isLiked: false,
  },
];
