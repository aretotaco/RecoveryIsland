import VillaLayout from '../components/VillaLayout'
import { AffirmationDeck, GoalStepper, GratitudePromptPicker, StoriesOfHope } from '../components/InspirationInteractives'

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
          text: 'Tap through these affirmations one at a time. Say it aloud, write it down, or just sit with it for a moment.',
          component: <AffirmationDeck />
        },
        {
          icon: '📚',
          title: 'Stories of Hope',
          text: 'Real experiences from people who have navigated mental health challenges and found their way through. Read a story, see yourself in it, and know — you are never alone in this.',
          component: <StoriesOfHope />
        },
        {
          icon: '🎯',
          title: 'Goal Setting',
          text: "You don't need a 10-step plan. You need one honest intention and the willingness to begin. Open each phase when you're ready.",
          component: <GoalStepper />
        },
        {
          icon: '🌅',
          title: 'Gratitude Practice',
          text: "Gratitude doesn't mean pretending everything is fine. It means finding one real thing worth noticing. A new prompt whenever you need one.",
          component: <GratitudePromptPicker />
        },
        {
          icon: '🎓',
          title: "Maya's Story — When University Felt Like Too Much",
          text: "She left home excited and arrived at university terrified. What followed was a quiet unravelling that many students know — but few talk about. This is Maya's story of anxiety, courage, and finding her way back to herself.",
          script: `She had planned for this moment her entire life.

New city. New independence. New beginning.

What nobody told Maya was how loud the silence would be once her parents drove away.

In high school, she knew the rules. She knew the teachers. She knew where she stood.

University was different.

No one chased her for assignments. No one noticed if she missed a tutorial. The expectation was simple — and crushing: figure it out yourself.

The workload arrived like a wave she was not ready for.

Self-directed learning, they called it. Read the chapters. Form your own study schedule. Prepare for exams that were months away — or maybe weeks — it was hard to keep track.

She tried to keep up. She made lists. She rewrote her timetable three times.

But somewhere between the first assignment and the second, something started to shift.

She stopped sleeping well.

Not dramatically — just she would lie there, mind racing, replaying a seminar comment she had made, wondering if it sounded stupid, wondering if people had noticed, wondering if she was already falling behind.

Her shoulders ached. Her jaw was tight when she woke up.

She told herself it was just adjustment. Everyone felt this way.

The friendships she had imagined — easy, instant, like in the movies — had not quite materialised.

Her secondary school friends were at different universities, busy with their own new lives. The people in her dorm were friendly enough, but she felt like she was always slightly outside the joke.

She started declining invitations. It felt easier than the effort of pretending to be fine.

She did not have a name for what she was feeling.

It was not sadness, exactly. It was more like everything requiring twice as much energy as it should. Like she was walking through water. Like there was a low hum of dread underneath everything, all the time.

She Googled her symptoms at midnight: cannot sleep, muscle tension, constant worry, feeling disconnected.

The word that kept appearing was: anxiety.

She closed the tab.

In a call home, when her mum asked how university was going, Maya said: "Great. Really good."

She did not know how to explain something she did not fully understand herself.

She walked past a Student Counselling Services flyer eleven times before she took a photo of it.

She made an appointment, cancelled it, made it again.

When she finally sat down in the counsellor's office, she did not know what to say.

So she just said: I think I am not okay. And I do not know how long I have been not okay.

The counsellor listened. Not to fix. Not to minimise. Just — listened.

And then she said something Maya had never heard directed at her before:

"What you are describing is anxiety. It is very common — especially in the transition to university. And it is very treatable. You were right to come."

Over the following weeks, Maya began to understand herself differently.

She saw a psychiatrist, who helped her understand why her nervous system had been running on high alert for so long. She learned what anxiety actually was — not weakness, not failure, not a character flaw. A pattern. A signal. Something that could be worked with.

She started tracking her moods. Some days were hard. Some were surprisingly okay.

Slowly, carefully, she started letting people in.

She told her flatmate one evening, almost by accident. Her flatmate said: "Oh my god, me too. I have been losing it."

They laughed — really laughed — for the first time.

Maya did not suddenly become a different person.

She still found group projects stressful. She still overthought emails. She still had weeks where everything felt heavier than it should.

But she had something she did not have before.

She had words for what she was feeling. She had a counsellor she trusted. She had a flatmate who got it. And she had the knowledge — hard-won and real — that asking for help was not giving up.

It was the bravest thing she had ever done.

Recovery does not mean the anxiety disappears forever.

It means you learn to notice it. To understand it. To care for yourself well enough that it no longer runs your life.

It means checking in — not just once, but regularly. Tracking how you feel. Noticing patterns. Coming back to the tools that help.

If you are in the middle of your own transition — new place, new expectations, new version of yourself you have not quite met yet — know this:

What you are feeling is real. It has a name. And you do not have to carry it alone.
It is okay to have anxiety.

It is okay to need support.

It is okay to come back here — as many times as you need.`
        }
      ]
    }} />
  )
}
