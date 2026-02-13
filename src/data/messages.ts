export interface MilestoneMessage {
  levelId: number;
  title: string;
  message: string;
}

export const milestoneMessages: MilestoneMessage[] = [
  {
    levelId: 1,
    title: 'The Beginning',
    message: 'A DM on Instagram. A match on Tinder. Two people at UCSC who had no idea what was about to start. From that very first conversation, something just clicked — and nothing was ever the same.',
  },
  {
    levelId: 2,
    title: 'Adventures Together',
    message: 'The bass dropped, the lights went crazy, and we were right there in the middle of it all. From Portola to every show in between, the music always hit different with you next to me.',
  },
  {
    levelId: 3,
    title: 'Through Everything',
    message: 'San Jose to San Jose — different houses, same love. Your parents\' place, my apartment, and all those drives in between. We chose each other every single day, and the distance never stood a chance.',
  },
  {
    levelId: 4,
    title: 'Forever & Always',
    message: 'Twin Peaks. Our place. That view we get to wake up to together. Four years of building something real — and this is just the beginning of our forever.',
  },
];

export const finalMessage = {
  title: 'Yash & Noorie',
  subtitle: '4 Years Down, Forever to Go',
  letter: `Noorie,

Four years ago I slid into your DMs like an absolute shot-taker, and somehow you actually responded. Best decision I ever made. Best risk I ever took.

From UCSC to right now, you've turned my whole world upside down in the best way. Those early days of getting to know you — staying up way too late texting, finding every excuse to see you, realizing pretty fast that I was in trouble because you were it.

Then came the concerts, the raves, Portola in SF where the music hit different and we were on another level together. Every festival, every show — I look over at you losing yourself in the music and I still think damn, she's the most beautiful person I've ever seen.

And yeah, living apart in San Jose wasn't always easy. You at your parents' place, me at mine, and all those drives back and forth. But we made it work because what we have is bigger than any distance. Every FaceTime call, every visit, every time I got to see you — worth it, every single time.

Now we're in our Twin Peaks apartment with that ridiculous view, and I get to come home to you every day. September 2025 was when it all came together — literally. Waking up next to you never gets old. (And yes, you're still the hottest person I know. That hasn't changed.)

Happy 4 years, baby. Happy anniversary today, happy Valentine's tomorrow, and happy Paso Robles this weekend. Wineries, good food, a cute Airbnb — but honestly, I'm just happy it's with you.

Here's to every year after this one.

I love you, Noorie. More than you know.

Always yours,
Yash 💕`,
};

export function getMilestoneMessage(levelId: number): MilestoneMessage | undefined {
  return milestoneMessages.find(m => m.levelId === levelId);
}
