export interface MilestoneMessage {
  levelId: number;
  title: string;
  message: string;
}

export const milestoneMessages: MilestoneMessage[] = [
  {
    levelId: 1,
    title: 'Year One',
    message: 'The spark that started it all. Every great love story begins with a single moment, and ours was the most beautiful one. From the very first hello, I knew something magical was happening.',
  },
  {
    levelId: 2,
    title: 'Year Two',
    message: 'We explored the world together and found that the best adventures aren\'t about the places — they\'re about having you beside me. Every sunset was more beautiful because we shared it.',
  },
  {
    levelId: 3,
    title: 'Year Three',
    message: 'Through every storm and every sunshine, we held on tighter. We proved that love isn\'t about perfect days — it\'s about choosing each other, every single day, no matter what.',
  },
  {
    levelId: 4,
    title: 'Year Four',
    message: 'Four years of love, laughter, tears, and a million tiny moments that became our story. You are my home, my best friend, my forever. Here\'s to us, and to the beautiful forever ahead.',
  },
];

export const finalMessage = {
  title: 'Our Journey',
  subtitle: '4 Years of Us',
  letter: `My love,

Four years ago, we started a journey together — one that's been filled with more joy, laughter, and love than I ever thought possible.

Every day with you is an adventure. Every moment is a memory I treasure. You've made me a better person, and our love story is my favorite one ever told.

Thank you for four incredible years. Thank you for being you. Thank you for choosing us.

Here's to our forever.

I love you more than yesterday, less than tomorrow.

Always yours 💕`,
};

export function getMilestoneMessage(levelId: number): MilestoneMessage | undefined {
  return milestoneMessages.find(m => m.levelId === levelId);
}
