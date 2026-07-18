import alpineHero from '../assets/illustrations/alpine-hero.svg';
import snowflakeGoat from '../assets/illustrations/snowflake-goat.svg';
import frankfurtWindow from '../assets/illustrations/frankfurt-window.svg';
import chalet from '../assets/illustrations/chalet.svg';

const now = Date.now();
const isoDaysAgo = (days) => new Date(now - days * 86400000).toISOString();

export const mockQuestions = [
  {
    questionId: 'heidi-q-001',
    questionText: 'Who welcomes Heidi when she first reaches the mountain cabin?',
    options: [
      { id: 'A', text: 'Grandfather' },
      { id: 'B', text: 'Peter' },
      { id: 'C', text: 'Clara' },
      { id: 'D', text: 'Miss Rottenmeier' },
    ],
    correctOptionId: 'A',
    imageUrl: chalet,
    imageContext: "Grandfather's cabin stands high above the village on the sunny Alm.",
    active: true,
    createdAt: isoDaysAgo(14),
    updatedAt: isoDaysAgo(2),
  },
  {
    questionId: 'heidi-q-002',
    questionText: "What is Peter's daily responsibility in the Alps?",
    options: [
      { id: 'A', text: 'Taking the village goats to pasture' },
      { id: 'B', text: 'Driving a train to Frankfurt' },
      { id: 'C', text: 'Teaching at the village school' },
      { id: 'D', text: 'Baking bread for Grandmother' },
    ],
    correctOptionId: 'A',
    imageUrl: alpineHero,
    imageContext: 'Peter guides the goats through the high meadows each morning.',
    active: true,
    createdAt: isoDaysAgo(13),
    updatedAt: isoDaysAgo(4),
  },
  {
    questionId: 'heidi-q-003',
    questionText: 'Which city does Heidi travel to so she can become a companion to Clara?',
    options: [
      { id: 'A', text: 'Zurich' },
      { id: 'B', text: 'Frankfurt' },
      { id: 'C', text: 'Vienna' },
      { id: 'D', text: 'Munich' },
    ],
    correctOptionId: 'B',
    imageUrl: frankfurtWindow,
    imageContext: 'The city house is comfortable, but Heidi deeply misses the mountains.',
    active: true,
    createdAt: isoDaysAgo(11),
    updatedAt: isoDaysAgo(3),
  },
  {
    questionId: 'heidi-q-004',
    questionText: 'What is the name of the gentle white goat Heidi especially loves?',
    options: [
      { id: 'A', text: 'Bear' },
      { id: 'B', text: 'Swan' },
      { id: 'C', text: 'Snowflake' },
      { id: 'D', text: 'Daisy' },
    ],
    correctOptionId: 'C',
    imageUrl: snowflakeGoat,
    imageContext: 'Snowflake is small, white, affectionate, and very dear to Heidi.',
    active: true,
    createdAt: isoDaysAgo(9),
    updatedAt: isoDaysAgo(1),
  },
  {
    questionId: 'heidi-q-005',
    questionText: 'What helps Clara grow stronger during her stay on the Alm?',
    options: [
      { id: 'A', text: 'Fresh air, friendship, and daily movement' },
      { id: 'B', text: 'Staying indoors all day' },
      { id: 'C', text: 'Returning immediately to Frankfurt' },
      { id: 'D', text: 'Studying without rest' },
    ],
    correctOptionId: 'A',
    imageUrl: alpineHero,
    imageContext: 'Life outdoors and the encouragement of her friends give Clara confidence.',
    active: true,
    createdAt: isoDaysAgo(7),
    updatedAt: isoDaysAgo(1),
  },
  {
    questionId: 'heidi-q-006',
    questionText: "Where does Heidi choose to sleep inside Grandfather's cabin?",
    options: [
      { id: 'A', text: 'Beside the fireplace' },
      { id: 'B', text: 'In the hayloft' },
      { id: 'C', text: 'Under the table' },
      { id: 'D', text: 'Outside beneath a tree' },
    ],
    correctOptionId: 'B',
    imageUrl: chalet,
    imageContext: 'The fragrant hayloft becomes Heidi’s cozy room beneath the roof.',
    active: true,
    createdAt: isoDaysAgo(6),
    updatedAt: isoDaysAgo(1),
  },
];

export const mockSessions = [
  {
    sessionId: 'heidi-session-001',
    title: 'Life on the Alm',
    description: 'Characters, places, animals, and memorable moments from Heidi’s mountain home.',
    publicCode: 'ALM1974',
    status: 'OPEN',
    questionCount: 6,
    participantCount: 18,
    createdAt: isoDaysAgo(4),
    updatedAt: new Date().toISOString(),
    openedAt: isoDaysAgo(.08),
    closedAt: '',
  },
  {
    sessionId: 'heidi-session-002',
    title: 'Heidi and Her Friends',
    description: 'A gentle review of Peter, Clara, Grandmother, Grandfather, and the village community.',
    publicCode: 'FRIEND7',
    status: 'DRAFT',
    questionCount: 5,
    participantCount: 0,
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(1),
    openedAt: '',
    closedAt: '',
  },
  {
    sessionId: 'heidi-session-003',
    title: 'The Frankfurt Chapters',
    description: 'Heidi’s city experience, her friendship with Clara, and her longing for the Alps.',
    publicCode: 'CITY808',
    status: 'CLOSED',
    questionCount: 4,
    participantCount: 24,
    createdAt: isoDaysAgo(8),
    updatedAt: isoDaysAgo(2),
    openedAt: isoDaysAgo(7),
    closedAt: isoDaysAgo(6),
  },
  {
    sessionId: 'heidi-session-004',
    title: 'Mountain Adventures',
    description: 'A scenic quiz about the goats, trails, weather, and daily life above the village.',
    publicCode: 'GOATS42',
    status: 'OPEN',
    questionCount: 6,
    participantCount: 11,
    createdAt: isoDaysAgo(2),
    updatedAt: new Date().toISOString(),
    openedAt: isoDaysAgo(.04),
    closedAt: '',
  },
];

export const mockParticipants = [
  { participantId: 'p-01', guestName: 'Clara', status: 'COMPLETED', totalQuestions: 6, answeredCount: 6, correctCount: 6, incorrectCount: 0, score: 6, progressPercent: 100, accuracyPercent: 100, rank: 1, lastActivityAt: new Date().toISOString() },
  { participantId: 'p-02', guestName: 'Peter', status: 'ACTIVE', totalQuestions: 6, answeredCount: 5, correctCount: 4, incorrectCount: 1, score: 4, progressPercent: 83.33, accuracyPercent: 80, rank: 2, lastActivityAt: isoDaysAgo(.001) },
  { participantId: 'p-03', guestName: 'Brigida', status: 'ACTIVE', totalQuestions: 6, answeredCount: 4, correctCount: 4, incorrectCount: 0, score: 4, progressPercent: 66.67, accuracyPercent: 100, rank: 3, lastActivityAt: isoDaysAgo(.002) },
  { participantId: 'p-04', guestName: 'Sebastian', status: 'ACTIVE', totalQuestions: 6, answeredCount: 4, correctCount: 3, incorrectCount: 1, score: 3, progressPercent: 66.67, accuracyPercent: 75, rank: 4, lastActivityAt: isoDaysAgo(.004) },
  { participantId: 'p-05', guestName: 'Tinette', status: 'ACTIVE', totalQuestions: 6, answeredCount: 2, correctCount: 1, incorrectCount: 1, score: 1, progressPercent: 33.33, accuracyPercent: 50, rank: 5, lastActivityAt: isoDaysAgo(.008) },
];

export const mockResults = {
  session: mockSessions[0],
  summary: { participantCount: mockParticipants.length, completedCount: 1, inProgressCount: 4, questionCount: 6 },
  participants: mockParticipants,
};

export const mockQuiz = {
  session: { ...mockSessions[0] },
  participant: { ...mockParticipants[1], sessionId: mockSessions[0].sessionId },
  questions: mockQuestions.map((question, index) => ({
    ...question,
    correctOptionId: undefined,
    questionOrder: index + 1,
    points: 1,
    answered: false,
    previousAnswer: null,
  })),
};

export const mockActivity = [
  { icon: 'person_add', title: 'Clara joined Life on the Alm', time: 'Just now' },
  { icon: 'task_alt', title: 'Peter answered question 5', time: '2 minutes ago' },
  { icon: 'quiz', title: 'Snowflake question was updated', time: '18 minutes ago' },
  { icon: 'play_circle', title: 'Mountain Adventures was opened', time: '36 minutes ago' },
];
