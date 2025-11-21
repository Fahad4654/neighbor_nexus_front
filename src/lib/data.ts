export type User = {
  id: string;
  name: string;
  avatarId: string;
  rating: number;
  reviews: number;
};

export type Tool = {
  id: string;
  name: string;
  description: string;
  imageId: string;
  category: string;
  user: User;
  rate: number;
  available: boolean;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  imageId: string;
  category: string;
  user: User;
  rate: string;
};

export type Transaction = {
  id: string;
  item: string;
  type: 'Tool' | 'Skill';
  user: User;
  status: 'Pending' | 'Active' | 'Completed';
  date: string;
};

export const users: User[] = [
  { id: 'user-1', name: 'John Smith', avatarId: 'user-avatar-1', rating: 4.5, reviews: 12 },
  { id: 'user-2', name: 'Emily White', avatarId: 'user-avatar-2', rating: 5, reviews: 8 },
  { id: 'user-3', name: 'Michael Brown', avatarId: 'user-avatar-3', rating: 4.2, reviews: 5 },
  { id: 'user-4', name: 'Sarah Green', avatarId: 'user-avatar-4', rating: 4.8, reviews: 20 },
];

export const tools: Tool[] = [
  {
    id: 'tool-1',
    name: 'Heavy Duty Hammer Drill',
    description: 'Powerful drill for concrete and masonry projects. Comes with a full set of bits.',
    imageId: 'tool-drill',
    category: 'power tools',
    user: users[0],
    rate: 25,
    available: true,
  },
  {
    id: 'tool-2',
    name: '20-foot Extension Ladder',
    description: 'Lightweight aluminum ladder, perfect for reaching high places safely.',
    imageId: 'tool-ladder',
    category: 'ladders',
    user: users[1],
    rate: 15,
    available: true,
  },
  {
    id: 'tool-3',
    name: 'Professional Lawn Mower',
    description: 'Self-propelled gas mower for a clean and quick cut on any lawn size.',
    imageId: 'tool-mower',
    category: 'gardening',
    user: users[2],
    rate: 30,
    available: false,
  },
  {
    id: 'tool-4',
    name: 'Electric Pressure Washer',
    description: '1800 PSI electric pressure washer for cleaning decks, siding, and driveways.',
    imageId: 'tool-washer',
    category: 'cleaning',
    user: users[3],
    rate: 20,
    available: true,
  },
];

export const skills: Skill[] = [
  {
    id: 'skill-1',
    name: 'Garden Design & Landscaping',
    description: 'Expert advice and hands-on help to transform your garden into a beautiful oasis.',
    imageId: 'skill-gardening',
    category: 'home & garden',
    user: users[3],
    rate: '50',
  },
  {
    id: 'skill-2',
    name: 'Basic Plumbing Repairs',
    description: 'Fixing leaky faucets, clogged drains, and other minor plumbing issues. Tools included.',
    imageId: 'skill-plumbing',
    category: 'repairs',
    user: users[0],
    rate: '45',
  },
  {
    id: 'skill-3',
    name: 'Custom Bookshelf Building',
    description: 'Will design and build custom bookshelves to fit your space and style.',
    imageId: 'skill-carpentry',
    category: 'woodworking',
    user: users[2],
    rate: '60',
  },
  {
    id: 'skill-4',
    name: 'Home IT & Network Setup',
    description: 'Help with setting up Wi-Fi networks, troubleshooting computer issues, and smart home configuration.',
    imageId: 'skill-it',
    category: 'tech',
    user: users[1],
    rate: '55',
  },
];

export const transactions: Transaction[] = [
  { id: 'tx-1', item: 'Heavy Duty Hammer Drill', type: 'Tool', user: users[2], status: 'Active', date: '2024-07-20' },
  { id: 'tx-2', item: 'Garden Design', type: 'Skill', user: users[3], status: 'Completed', date: '2024-07-18' },
  { id: 'tx-3', item: 'Electric Pressure Washer', type: 'Tool', user: users[0], status: 'Pending', date: '2024-07-21' },
  { id: 'tx-4', item: 'Basic Plumbing Repairs', type: 'Skill', user: users[1], status: 'Completed', date: '2024-06-15' },
  { id: 'tx-5', item: '20-foot Extension Ladder', type: 'Tool', user: users[3], status: 'Active', date: '2024-07-19' },
  { id: 'tx-6', item: 'Professional Lawn Mower', type: 'Tool', user: users[0], status: 'Completed', date: '2024-07-10' },
];
