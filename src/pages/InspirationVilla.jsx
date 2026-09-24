import VillaLayout from '../components/VillaLayout'
import { AffirmationDeck, GoalStepper, GratitudePromptPicker } from '../components/InspirationInteractives'

export default function InspirationVilla() {
  return (
    <VillaLayout villa={{
      id: 6,
      name: 'Inspiration Villa',
      emoji: '\u2728',
      color: '#f97316',
      colorLight: '#fdba74',
      tagline: "You have everything within you. Let's help you remember that.",
      sections: [
        {
          icon: '💡',
          title: 'Daily Affirmations',
          text: 'Tap through these affirmations one at a time. Save your favourites, filter by theme, say it aloud, or just sit with it for a moment.',
          component: <AffirmationDeck />
        },
        {
          icon: '🎓',
          title: 'Coping With Academic Stress: You Are Doing More Than You Think',
          text: 'A short video on recognising academic pressure for what it is, and finding steadier ground when the workload feels like too much.',
          videoUrl: 'https://youtu.be/2Ckfep6RHrg',
        },
        {
          icon: '🌍',
          title: 'Finding Belonging in a New Culture: Finding Your Place',
          text: 'On the quiet disorientation of adjusting to a new culture or place, and what it takes to start feeling at home again.',
          videoUrl: 'https://youtu.be/bGh1-hh-kQU',
        },
        {
          icon: '💼',
          title: "Managing Internship Anxiety: You Don't Have to Prove Yourself",
          text: 'A reminder that you were chosen to learn, not to already know everything — for anyone feeling the pressure of a new internship.',
          // TODO: replace with the real Unlisted YouTube link once uploaded.
          videoUrl: 'https://youtu.be/REPLACE_WITH_VIDEO_3_ID',
        },
        {
          icon: '🎯',
          title: 'Goal Setting',
          text: "You don't need a 10-step plan. You need one honest intention and the willingness to begin. Set your intention below, then work through each phase at your own pace.",
          component: <GoalStepper />
        },
        {
          icon: '🌅',
          title: 'Gratitude Practice',
          text: "Gratitude doesn't mean pretending everything is fine. It means finding one real thing worth noticing. Write a short reflection to a prompt whenever you need one — your recent entries are saved below.",
          component: <GratitudePromptPicker />
        },
      ]
    }} />
  )
}

