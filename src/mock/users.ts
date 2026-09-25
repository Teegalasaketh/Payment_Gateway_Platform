import type { User } from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Sarah Connor',
    email: 'sarah.connor@cyberdyne.com',
    role: 'Admin',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: '2025-01-15T08:30:00Z',
  },
  {
    id: 'usr-2',
    name: 'John Doe',
    email: 'john.doe@enterprise.com',
    role: 'User',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    createdAt: '2025-02-10T14:22:00Z',
  },
  {
    id: 'usr-3',
    name: 'Jane Smith',
    email: 'jane.smith@fintech.io',
    role: 'User',
    status: 'Pending',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    createdAt: '2025-03-01T09:15:00Z',
  },
  {
    id: 'usr-4',
    name: 'Alex Mercer',
    email: 'alex.mercer@gentek.org',
    role: 'Admin',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    createdAt: '2024-11-12T11:45:00Z',
  },
  {
    id: 'usr-5',
    name: 'Elena Rostova',
    email: 'elena.rostova@kronos.ru',
    role: 'User',
    status: 'Suspended',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    createdAt: '2024-12-05T16:40:00Z',
  },
  {
    id: 'usr-6',
    name: 'Marcus Wright',
    email: 'marcus.wright@projectangel.com',
    role: 'User',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    createdAt: '2025-01-20T10:10:00Z',
  },
  {
    id: 'usr-7',
    name: 'Chloe Frazer',
    email: 'chloe.frazer@heritage.org',
    role: 'User',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    createdAt: '2025-02-18T13:55:00Z',
  },
  {
    id: 'usr-8',
    name: 'Victor Sullivan',
    email: 'sully@treasurehunt.com',
    role: 'User',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    createdAt: '2024-09-25T17:30:00Z',
  },
  {
    id: 'usr-9',
    name: 'Ada Wong',
    email: 'ada.wong@umbrella.com',
    role: 'Admin',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    createdAt: '2024-10-05T07:12:00Z',
  },
  {
    id: 'usr-10',
    name: 'Leon Kennedy',
    email: 'leon.kennedy@dsd.gov',
    role: 'User',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150',
    createdAt: '2025-01-08T15:20:00Z',
  },
  // Automatically generating 40 additional realistic users to complete the 50-user requirement
  ...Array.from({ length: 40 }, (_, i) => {
    const idNum = i + 11;
    const names = [
      'David Miller', 'Emma Watson', 'James Bond', 'Diana Prince', 'Bruce Wayne',
      'Clark Kent', 'Peter Parker', 'Barry Allen', 'Hal Jordan', 'Arthur Curry',
      'Tony Stark', 'Steve Rogers', 'Natasha Romanoff', 'Bruce Banner', 'Thor Odinson',
      'Clint Barton', 'Wanda Maximoff', 'Vision Prime', 'Sam Wilson', 'Bucky Barnes',
      'TChalla King', 'Peter Quill', 'Gamora Titan', 'Rocket Raccoon', 'Groot Branch',
      'Drax Destroyer', 'Carol Danvers', 'Nick Fury', 'Maria Hill', 'Phil Coulson',
      'Matt Murdock', 'Jessica Jones', 'Luke Cage', 'Danny Rand', 'Frank Castle',
      'Wade Wilson', 'Logan Howlett', 'Charles Xavier', 'Erik Lehnsherr', 'Jean Grey'
    ];
    const domains = ['enterprise.com', 'paymentgw.net', 'finance.org', 'securepay.co', 'cloudbank.io'];
    const roles: ('Admin' | 'User')[] = idNum % 8 === 0 ? ['Admin'] : ['User'];
    const statuses: ('Active' | 'Suspended' | 'Pending')[] = 
      idNum % 12 === 0 ? ['Suspended'] : idNum % 9 === 0 ? ['Pending'] : ['Active'];
    
    const name = names[i % names.length];
    const email = `${name.toLowerCase().replace(' ', '.')}@${domains[i % domains.length]}`;
    
    return {
      id: `usr-${idNum}`,
      name,
      email,
      role: roles[0],
      status: statuses[0],
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + idNum * 1234}?w=150` || undefined,
      createdAt: new Date(2025, i % 12, (i % 28) + 1, 10, 30).toISOString(),
    };
  })
];
