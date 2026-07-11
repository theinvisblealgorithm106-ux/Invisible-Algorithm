export interface ExecutiveTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  school?: string;
  avatar: string;
  bio: string;
}

export const executiveTeam: ExecutiveTeamMember[] = [
  {
    id: 'ishita-batra',
    firstName: 'Ishita',
    lastName: 'Batra',
    role: 'Founder',
    avatar: '/team/ishita-batra.jpeg',
    bio: "Growing up, Ishita was caught between two worlds — a computer-scientist father who ranted about bugs and algorithms at dinner, and a mother's side of the family that explained economics using vegetables. Enough questions later, that curiosity turned into The Invisible Algorithm, a youth-led initiative making technology and AI more accessible to students worldwide through workshops, research, and a global community of curious minds.",
  },
  {
    id: 'shriyan',
    firstName: 'Shriyan',
    lastName: '',
    role: 'Executive Team',
    avatar: '/team/shriyan.png',
    bio: "A builder at heart, Shriyan spends his time turning ideas into real projects — robots, games, websites, and personal builds like CogniFlow. Most of his time goes into Onshape, coding, robotics, and 3D printing, with a constant focus on learning how things work and making them better. Currently exploring Unity, AI, and game development.",
  },
  {
    id: 'tanya-mangla',
    firstName: 'Tanya',
    lastName: 'Mangla',
    role: 'Executive Team',
    avatar: '/team/tanya-mangla.jpeg',
    bio: "A Grade 10 student surrounded by finance professionals since childhood, Tanya knew what GST meant before fifth grade. When the family ran out of patience for her questions, she turned to Google — and later ChatGPT and Gemini — to make sense of it all. That curiosity about both finance and AI is exactly why she connects with The Invisible Algorithm's mission.",
  },
  {
    id: 'aarvi-malik',
    firstName: 'Aarvi',
    lastName: 'Malik',
    role: 'Executive Head of Social Media and Outreach',
    school: 'Bal Bharati Public School, Pitampura',
    avatar: '/team/aarvi-malik.jpeg',
    bio: "A Grade 10 student and public speaker since age 3, Aarvi won Best Speaker from India's Ministry of Education and earned an honourable mention at The GOI Peace Foundation Japan International Essay Competition. Through TIA's workshops, she connects brilliant learners globally.",
  },
  {
    id: 'saanvi',
    firstName: 'Saanvi',
    lastName: '',
    role: 'Executive Director of Creative Design',
    school: 'Harold M. Braithwaite (IB Diploma, Canada)',
    avatar: '/team/saanvi.jpeg',
    bio: "Art meant nothing to Saanvi until a Grade 5 art contest, when creating her first piece just clicked — a way to express herself without words. Since then she's explored countless styles and techniques, earning awards along the way and discovering that art, especially fashion, is one of the most powerful ways to show personality and individuality. As Executive Director of Creative Design, she champions imagination and proves art has a heartbeat as long as people keep dreaming and creating.",
  },
];
