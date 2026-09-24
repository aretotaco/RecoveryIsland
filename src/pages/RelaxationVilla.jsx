import VillaLayout from '../components/VillaLayout'
import BreathingPacer from '../components/BreathingPacer'

export default function RelaxationVilla() {
  return (
    <VillaLayout villa={{
      id: 4,
      name: 'Relaxation Villa',
      emoji: '🌿',
      color: '#06b6d4',
      colorLight: '#67e8f9',
      tagline: 'Let go of everything you are carrying. You are safe here.',
      sections: [
        {
          icon: '🫁',
          title: 'Abdominal Breathing and Muscle Relaxation',
          text: 'A guided escape using deep abdominal breathing and progressive muscle relaxation to melt away tension from head to toe. The 4-7-8 pacer below is a gentle way to begin.',
          videoUrl: 'https://www.youtube.com/embed/xtklDYGoO0M?rel=0&modestbranding=1',
          component: <BreathingPacer pattern="478" />
        },
        {
          icon: '🎈',
          title: 'Air Balloon',
          text: 'Float gently above your worries in this soothing visualisation. Let the air balloon carry you to a place of complete calm and ease.',
          videoUrl: 'https://www.youtube.com/embed/abzSsh7MrLE?rel=0&modestbranding=1'
        },
        {
          icon: '🏯',
          title: 'A Trip to China',
          text: 'A serene guided journey through the peaceful landscapes of China. Let your mind wander and your body unwind.',
          videoUrl: 'https://www.youtube.com/embed/lCKL3Cdgg34?rel=0&modestbranding=1'
        },
        {
          icon: '✨',
          title: 'A Land of Happiness',
          text: 'Travel to an imagined place filled with warmth, light, and joy. A gentle escape to restore your sense of peace and wellbeing.',
          videoUrl: 'https://www.youtube.com/embed/neADoCR6UKI?rel=0&modestbranding=1'
        },
        {
          icon: '🌸',
          title: 'A Land of Flowers',
          text: 'Wander through fields of colour and fragrance in this calming visualisation. Let nature\'s beauty ease your mind and soften your breath.',
          videoUrl: 'https://www.youtube.com/embed/CmnsShzC-1Q?rel=0&modestbranding=1'
        },
        {
          icon: '🛤️',
          title: 'A Journey to Relaxation',
          text: 'A guided journey inward — following the path of your breath until you arrive at a place of deep, restful calm.',
          videoUrl: 'https://www.youtube.com/embed/H0auVNEhaww?rel=0&modestbranding=1'
        },
        {
          icon: '🌙',
          title: 'Sleep Preparation',
          text: 'Wind-down routines to prepare your mind and body for restorative sleep. Because rest is not a luxury — it is a necessity.'
        },
        {
          icon: '☁️',
          title: 'Stress Release',
          text: 'Evidence-based techniques for releasing chronic stress and tension. Learn to shift from fight-or-flight to rest-and-digest.'
        },
        {
          icon: '🫶',
          title: 'Self-Compassion',
          text: 'Gentle self-compassion practices inspired by Dr. Kristin Neff\'s research. Treat yourself with the kindness you deserve.'
        }
      ]
    }} />
  )
}