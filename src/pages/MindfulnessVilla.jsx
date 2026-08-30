import VillaLayout from '../components/VillaLayout'
import BreathingPacer from '../components/BreathingPacer'

export default function MindfulnessVilla() {
  return (
    <VillaLayout villa={{
      id: 3,
      name: 'Mindfulness Villa',
      emoji: '🧘',
      color: '#10b981',
      colorLight: '#6ee7b7',
      tagline: 'Breathe in. Breathe out. The present moment is always enough.',
      sections: [
        {
          icon: '🌬️',
          title: 'Mindful Breathing',
          text: 'Guided breathing techniques from box breathing to 4-7-8 breathing. Calm your nervous system in minutes with science-backed methods. Try the pacer below whenever you need a reset.',
          videoUrl: 'https://www.youtube.com/embed/VTA2na5-B58?rel=0&modestbranding=1',
          component: <BreathingPacer pattern="box" />
        },
        {
          icon: '🧠',
          title: 'Loving Kindness Meditation',
          text: 'Open your heart with this guided loving-kindness practice. Cultivate compassion for yourself and others, and soften the inner critic.',
          videoUrl: 'https://www.youtube.com/embed/TabE4mr4QS4?rel=0&modestbranding=1'
        },
        {
          icon: '🌿',
          title: 'Body Scan Practice',
          text: 'Ground yourself in your physical experience. Our guided body scan meditation helps release tension and reconnect you with the present.',
          videoUrl: 'https://www.youtube.com/embed/WwFNH-U-d5s?rel=0&modestbranding=1'
        },
        {
          icon: '🛑',
          title: 'S.T.O.P Technique',
          text: 'Stop, Take a breath, Observe, Proceed. A quick and powerful mindfulness technique you can use any time stress feels overwhelming.',
          videoUrl: 'https://www.youtube.com/embed/NPew-vctZUc?rel=0&modestbranding=1'
        },
        {
          icon: '🕊️',
          title: 'Let Go Meditation',
          text: 'A calming guided meditation to help you release what you no longer need to carry — thoughts, tension, and the weight of the day.',
          videoUrl: 'https://www.youtube.com/watch?v=qUMZk17WAtQ&t=1s'
        }
      ]
    }} />
  )
}