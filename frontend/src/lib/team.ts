// SEED DATA ONLY — not what the site renders.
//
// The executive team now lives in MongoDB (models/TeamMember.ts) and is edited
// from the admin panel's Team tab. This array is copied into that collection
// once, by seedTeamIfEmpty() in lib/teamSeed.ts, on the first request to
// /api/team against an empty collection.
//
// Editing a bio here has no effect on a database that has already been seeded;
// edit it in the admin panel instead.
export interface ExecutiveTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  school?: string;
  avatar: string;
  avatarPosition?: string;
  bio: string;
}

export const executiveTeam: ExecutiveTeamMember[] = [
  {
    id: 'ishita-batra',
    firstName: 'Ishita',
    lastName: 'Batra',
    role: 'Founder & Executive Director of Research and Publications',
    avatar: '/team/ishita-batra.jpeg',
    bio: "Heyyyyy~! My name is Ishita Batra, but most people call me Ish.\n\nGrowing up, I was caught between two very different worlds. My father is a computer scientist who would casually rant about bugs, algorithms, and coding disasters at the dinner table. Meanwhile, my mother's side of the family somehow managed to explain half of economics to me using vegetables.\n\nAs a result, I spent my childhood hearing about software crashes and calculating profits on imaginary potatoes.\n\nLike any curious kid, I started asking questions. Then more questions. Then enough questions to accidentally start an organization.\n\nWhat began as curiosity slowly turned into Invisible Algorithm, a youth-led initiative dedicated to making technology and AI more accessible to students worldwide. Today, we organize workshops, conduct research, and connect students from across the globe through a shared love of innovation, curiosity, and occasionally questioning why the Wi-Fi stops working at the worst possible moment.\n\nTurns out all those bug rants and vegetable lessons were useful after all. (still questioning it, kinda.)\n\nYears ago, my family taught me profit-loss with potatoes. Today, we're teaching AI and business with workshops. We hope both are equally easy to digest. If not, #usecogniflow",
  },
  {
    id: 'shriyan',
    firstName: 'Shriyan',
    lastName: '',
    role: 'Executive Director of Information and Technology',
    avatar: '/team/shriyan.png',
    avatarPosition: 'object-top',
    bio: "Hi, I'm Shriyan! I love building things—whether it's a robot, a game, a website, or a random project like #CogniFlow. Most of my time goes into Onshape, coding, robotics, 3D printing, and experimenting with new technology. I enjoy turning ideas into real projects, learning how things work, and constantly challenging myself to create something better. Currently exploring Unity, AI, and game development while always looking for the next thing to learn and build.",
  },
  {
    id: 'tanya-mangla',
    firstName: 'Tanya',
    lastName: 'Mangla',
    role: 'Executive Director of Management and Operations',
    avatar: '/team/tanya-mangla.jpeg',
    bio: "Hello, I'm Tanya Mangla, unfortunately in Grade 10 (boards are no joke guys!).\n\nSince I have a lot of family members who are CAs and finance-focused, I've always been surrounded by conversations about finance. I knew what GST meant before I was even in fifth grade.\n\nBeing around all these finance people made me curious about what they were talking about and what all those terms meant. Somehow, instead of asking them (mostly because they eventually ran out of patience with my constant questions) I started going to Google. A few years later, ChatGPT, Gemini, and other AI tools joined the list.\n\nI guess that's where my journey with both finance and AI started, and that's also why I connect with The Invisible Algorithm's goal.\n\nHonestly, there was a point where understanding finance terms and AI concepts became a headache. So I guess #usecogniflow if you're anything like me.",
  },
  {
    id: 'saanvi',
    firstName: 'Saanvi',
    lastName: '',
    role: 'Executive Director of Creative Design',
    school: 'Harold M. Braithwaite (IB Diploma, Canada)',
    avatar: '/team/saanvi.jpeg',
    bio: "Hi, my name is Saanvi, and I am the Executive Director of Creative Design as well as a student at Harold M. Braithwaite in Canada, pursuing the IB Diploma.\n\nBelieve it or not, there was a time when art meant absolutely nothing to me. Everything changed in Grade 5 when my school hosted an art contest, and I decided to give it a shot. As I created my very first piece, something clicked. For the first time, I felt like I had found a way to express myself without words!\n\nThat one moment sparked something incredible in me. Since then, I have taken numerous art courses, explored different styles and techniques, and earned several awards along the way. Every class, project, and competition has helped me grow not only as an artist but also as a person. Over time, I realized that art is so much more than drawing or painting it is about expressing who you are. Fashion, in particular, is one of the most powerful forms of art because it allows us to show our personality,and individuality without saying a single word. \n\nThat is why I am proud to serve as the Executive Director of Creative Design to encourage imagination, embrace innovation, and prove that art will always have a heartbeat as long as humans continue to dream, create, and share their stories with the world.",
  },
];
