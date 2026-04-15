import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const hashedPassword = await bcrypt.hash('Test1234!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@guruupadesh.com' },
    update: {},
    create: {
      email: 'demo@guruupadesh.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      profile: {
        create: {
          bio: 'Demo user for Guru Upadesh platform',
          location: 'San Francisco, CA',
        },
      },
    },
  });

  console.log('Created demo user:', user.email);

  const questions = [
    {
      text: 'Tell me about a time when you had to work under pressure. How did you handle it?',
      category: 'BEHAVIORAL',
      difficulty: 'MEDIUM',
      tags: ['STAR', 'pressure', 'time-management'],
      hints: [
        'Use the STAR method',
        'Focus on specific actions you took',
        'Highlight the positive outcome',
      ],
    },
    {
      text: 'Explain the difference between var, let, and const in JavaScript.',
      category: 'TECHNICAL',
      difficulty: 'EASY',
      tags: ['JavaScript', 'variables', 'ES6'],
      hints: [
        'Consider scope differences',
        'Think about reassignment',
        'Mention hoisting behavior',
      ],
    },
    {
      text: 'Design a URL shortening service like bit.ly.',
      category: 'SYSTEM_DESIGN',
      difficulty: 'HARD',
      tags: ['system-design', 'scalability', 'databases'],
      hints: [
        'Consider the data model',
        'Think about collision handling',
        'Discuss scalability',
        'Consider analytics requirements',
      ],
    },
    {
      text: 'Describe a situation where you had to make a difficult decision with incomplete information.',
      category: 'SITUATIONAL',
      difficulty: 'MEDIUM',
      tags: ['decision-making', 'problem-solving'],
      hints: [
        'Explain your decision-making process',
        'Discuss how you gathered available information',
        'Share the outcome',
      ],
    },
    {
      text: 'Implement a function to reverse a linked list.',
      category: 'CODING',
      difficulty: 'MEDIUM',
      tags: ['linked-list', 'algorithms', 'data-structures'],
      company: 'Amazon',
      hints: [
        'Consider iterative vs recursive approaches',
        'Think about edge cases',
        'Discuss time and space complexity',
      ],
    },
  ];

  for (const question of questions) {
    await prisma.question.upsert({
      where: {
        id: `seed-${question.text.substring(0, 20).replace(/\s/g, '-')}`,
      },
      update: {},
      create: {
        ...question,
        hints: question.hints as any,
      },
    });
  }

  console.log(`Created ${questions.length} questions`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
