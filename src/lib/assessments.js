// Single source of truth for the emotion assessments (used by EmotionScales,
// MoodDiaryCentre, and InsightsDashboard) so scale definitions, max scores, and
// severity bands can never drift out of sync between pages.

const PSS_QS = [
  { text: 'In the last month, how often have you been upset because of something that happened unexpectedly?', reversed: false },
  { text: 'In the last month, how often have you felt that you were unable to control the important things in your life?', reversed: false },
  { text: 'In the last month, how often have you felt nervous and stressed?', reversed: false },
  { text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', reversed: true },
  { text: 'In the last month, how often have you felt that things were going your way?', reversed: true },
  { text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?', reversed: false },
  { text: 'In the last month, how often have you been able to control irritations in your life?', reversed: true },
  { text: 'In the last month, how often have you felt that you were on top of things?', reversed: true },
  { text: 'In the last month, how often have you been angered because of things that were outside of your control?', reversed: false },
  { text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', reversed: false },
]

const PHQ_QS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
]

const GAD_QS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
]

// CD-RISC-10 (Connor-Davidson Resilience Scale, 10-item version), from the
// official Appendix E questionnaire. All 10 items are scored directly (no
// reverse-scored items), 0-4 each, max 40.
const CDRISC_QS = [
  'I am able to adapt when changes occur.',
  'I can deal with whatever comes my way.',
  'I try to see the humorous side of things when I am faced with problems.',
  'Having to cope with stress can make me stronger.',
  'I tend to bounce back after illness, injury, or other hardships.',
  'I believe I can achieve my goals, even if there are obstacles.',
  'Under pressure, I stay focused and think clearly.',
  'I am not easily discouraged by failure.',
  'I think of myself as a strong person when dealing with life’s challenges and difficulties.',
  'I am able to handle unpleasant or painful feelings like sadness, fear, and anger.',
]

export const SCALES = [
  {
    id: 'pss',
    shortName: 'PSS-10',
    name: 'Perceived Stress Scale',
    icon: '🌊',
    color: '#8b5cf6',
    intro: 'The following questions ask about your feelings and thoughts during the last month. In each case, please indicate how often you felt or thought a certain way.',
    desc: 'Measures perceived stress over the past month.',
    options: ['Never', 'Almost Never', 'Sometimes', 'Fairly Often', 'Very Often'],
    questions: PSS_QS.map(q => q.text),
    reversed: PSS_QS.reduce((acc, q, i) => { if (q.reversed) acc.push(i); return acc }, []),
    maxScore: 40,
    getSeverity: s =>
      s < 14  ? { label: 'Low Stress',      color: '#10b981', tier: 'mild'     } :
      s <= 26 ? { label: 'Moderate Stress',  color: '#f59e0b', tier: 'moderate' } :
                { label: 'High Stress',      color: '#ef4444', tier: 'severe'   },
  },
  {
    id: 'phq',
    shortName: 'PHQ-9',
    name: 'Patient Health Questionnaire',
    icon: '💭',
    color: '#6366f1',
    intro: 'Over the last two weeks, how often have you been bothered by any of the following problems?',
    desc: 'Screens for depression over the past two weeks.',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    questions: PHQ_QS,
    reversed: [],
    maxScore: 27,
    getSeverity: s =>
      s <= 4  ? { label: 'None',                  color: '#10b981', tier: 'mild'     } :
      s <= 9  ? { label: 'Mild',                   color: '#84cc16', tier: 'mild'     } :
      s <= 14 ? { label: 'Moderate',               color: '#f59e0b', tier: 'moderate' } :
      s <= 19 ? { label: 'Moderately Severe',       color: '#f97316', tier: 'moderate' } :
                { label: 'Severe',                  color: '#ef4444', tier: 'severe'   },
  },
  {
    id: 'gad',
    shortName: 'GAD-7',
    name: 'General Anxiety Disorder',
    icon: '🫀',
    color: '#06b6d4',
    intro: 'Over the last two weeks, how often have you been bothered by any of the following problems?',
    desc: 'Screens for generalised anxiety over the past two weeks.',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    questions: GAD_QS,
    reversed: [],
    maxScore: 21,
    getSeverity: s =>
      s <= 4  ? { label: 'None-Minimal',  color: '#10b981', tier: 'mild'     } :
      s <= 9  ? { label: 'Mild',           color: '#84cc16', tier: 'mild'     } :
      s <= 14 ? { label: 'Moderate',       color: '#f59e0b', tier: 'moderate' } :
                { label: 'Severe',         color: '#ef4444', tier: 'severe'   },
  },
  {
    id: 'cdrisc',
    shortName: 'CD-RISC-10',
    name: 'Connor-Davidson Resilience Scale',
    icon: '🌱',
    color: '#10b981',
    intro: 'Please indicate how much you agree with the following statements as they apply to you over the last month. If a particular situation has not occurred recently, answer according to how you think you would have felt.',
    desc: 'Measures your resilience and ability to adapt to challenges.',
    options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all the time'],
    questions: CDRISC_QS,
    reversed: [],
    maxScore: 40,
    getSeverity: s =>
      s >= 28 ? { label: 'High Resilience',     color: '#10b981', tier: 'high'     } :
      s >= 14 ? { label: 'Moderate Resilience',  color: '#f59e0b', tier: 'moderate' } :
                { label: 'Low Resilience',        color: '#ef4444', tier: 'low'      },
  },
]

export function computeScore(scale, ans) {
  return scale.questions.reduce((sum, _, i) => {
    if (ans[i] === undefined) return sum
    const v = scale.reversed.includes(i) ? (scale.options.length - 1 - ans[i]) : ans[i]
    return sum + v
  }, 0)
}

export function getScaleById(id) {
  return SCALES.find(s => s.id === id)
}
