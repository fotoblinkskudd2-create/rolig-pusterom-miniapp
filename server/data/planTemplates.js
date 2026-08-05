// Rule-based action templates used to auto-generate 3-step plans.
// No AI / external APIs involved: we simply pick from a curated list per
// category, weighted toward whichever categories came up most in a session.

export const actionTemplates = {
  communication: [
    "Schedule 20 minutes of uninterrupted chat every evening, phones away.",
    "Try a 'talking token' — only the person holding it speaks, the other just listens.",
    "Once a week, each of you shares one thing on your mind that you haven't said yet.",
    "Before reacting to something that stings, ask one clarifying question first.",
  ],
  appreciation: [
    "Each day, tell your partner one specific thing you noticed and appreciated.",
    "Leave a short note or text for your partner highlighting something they did well.",
    "Start a shared 'gratitude list' and add to it once a week.",
    "End the day by naming one moment you were thankful for together.",
  ],
  "quality-time": [
    "Plan a screen-free date night this week, even if it's just 30 minutes at home.",
    "Pick one new activity to try together in the next two weeks.",
    "Recreate a favorite shared memory — same meal, same walk, same playlist.",
    "Set a weekly recurring 'us time' block on the calendar and protect it.",
  ],
  "trust-repair": [
    "Agree on one small, concrete promise you'll each keep this week and check in on it.",
    "Set a weekly 5-minute check-in just to ask 'how are we doing?'",
    "Write down one thing you need from each other to feel safer, and share it out loud.",
    "Revisit one unresolved topic together, with a goal of understanding rather than winning.",
  ],
  "emotional-safety": [
    "Agree on a simple signal ('pause') either of you can use when a conversation gets too heated.",
    "Practice naming feelings out loud before jumping to solutions.",
    "Set a rule: no big topics after 10pm — revisit when you're both rested.",
    "Ask 'what do you need right now, comfort or advice?' before responding to hard feelings.",
  ],
  "future-vision": [
    "Write down one shared goal for the next 3 months and one small step toward it.",
    "Plan a 'state of us' conversation once a month to check in on how things are going.",
    "Pick one new habit to build together and track it for a week.",
    "Dream out loud together about one thing you want to do in the next year.",
  ],
};

export const dateNightIdeas = [
  "Cook a new recipe together with your phones in another room.",
  "Take a slow walk with no destination and no agenda.",
  "Have a 'yearbook night' — look through old photos together.",
  "Write each other a short letter and swap them over tea.",
  "Build a shared playlist of songs that remind you of each other.",
  "Have a picnic, indoors or out, with your favorite snacks.",
  "Try a jigsaw puzzle or board game together.",
  "Stargaze or watch the sunset together, no phones.",
  "Give each other a 10-minute back or hand massage, no talking required.",
  "Plan next year's dream trip together, just for fun.",
];

export const badgeTiers = [
  { min: 0, name: "First Steps", emoji: "🌱" },
  { min: 20, name: "Getting Closer", emoji: "🤝" },
  { min: 50, name: "Reconnecting", emoji: "💬" },
  { min: 100, name: "Team Us", emoji: "💞" },
  { min: 200, name: "Deeply Rooted", emoji: "🌳" },
];

export function badgeForPoints(points) {
  let current = badgeTiers[0];
  for (const tier of badgeTiers) {
    if (points >= tier.min) current = tier;
  }
  return current;
}
