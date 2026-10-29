import bcrypt from 'bcryptjs';
import prisma from '../src/config/prisma.js';
import { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } from '../src/config/env.js';

/**
 * Database Seeder for IIIT Bhagalpur Curriculum Portal
 * Seeds the single faculty admin account and initial course offerings.
 */
async function main() {
  console.log('[SEED] Starting database seeding process...');

  // 1. Seed Faculty Admin Account
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: DEFAULT_ADMIN_EMAIL }
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
    const admin = await prisma.admin.create({
      data: {
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash
      }
    });
    console.log(`[SEED] Admin account seeded successfully: ${admin.email}`);
  } else {
    console.log(`[SEED] Admin account already exists: ${existingAdmin.email} (skipping)`);
  }

  // 2. Seed Initial B.Tech Course Offerings
  const sampleCourses = [
    {
      courseCode: 'CS305',
      courseName: 'Database Management Systems',
      programme: 'BTech',
      batch: '2024 - 2028',
      branch: 'CSE',
      semester: 'Semester 5',
      courseType: 'CORE',
      lecture: 3,
      tutorial: 0,
      practical: 0,
      credits: 3,
      courseObjectives:
        'To understand the fundamental concepts of database management systems, relational data models, SQL querying, transaction management, and relational database design principles.',
      moduleWiseSyllabusText:
        'Module 1: Overview of DBMS\nHistorical development, data models, database languages, architecture, data independence, schema and instances.\n\nModule 2: Relational model\nRelational algebra, tuple calculus, constraints, normalization (1NF, 2NF, 3NF, BCNF), ER model.\n\nModule 3: SQL basics\nDDL, DML, DCL, query formulation, subqueries, joins, query optimization, query processing and evaluation.\n\nModule 4: Transactions\nACID properties, concurrency control, serializability, locking protocols, crash recovery.\n\nModule 5: Storage Structures and Indexing\nStorage hierarchy, indexing and hashing, B-trees, B+ trees, query execution plans.',
      referenceBooksText:
        "1. Abraham Silberschatz, Henry F. Korth, S. Sudarshan, 'Database System Concepts', 7th Edition, McGraw-Hill, 2019.\n2. Ramez Elmasri, Shamkant B. Navathe, 'Fundamentals of Database Systems', 7th Edition, Pearson, 2016.\n3. Raghu Ramakrishnan, Johannes Gehrke, 'Database Management Systems', 3rd Edition, McGraw-Hill, 2014."
    },
    {
      courseCode: 'CS301',
      courseName: 'Design and Analysis of Algorithms',
      programme: 'BTech',
      batch: '2024 - 2028',
      branch: 'CSE',
      semester: 'Semester 5',
      courseType: 'CORE',
      lecture: 3,
      tutorial: 1,
      practical: 0,
      credits: 4,
      courseObjectives:
        'To develop rigorous mathematical and analytical understanding of designing efficient algorithms, asymptotic complexity analysis, graph algorithms, and NP-completeness.',
      moduleWiseSyllabusText:
        'Module 1: Algorithm Analysis and Asymptotic Notations\nOrder notation, asymptotic complexity, recurrence relations, master theorem.\n\nModule 2: Divide and Conquer, Greedy Algorithms\nDivide and conquer paradigms, greedy choice property, optimal substructure, Huffman codes.\n\nModule 3: Dynamic Programming\nPrinciple of optimality, memoization, matrix chain multiplication, longest common subsequence.\n\nModule 4: Graph Algorithms\nBreadth-first search, depth-first search, topological sort, minimum spanning trees, shortest paths.\n\nModule 5: NP-Completeness and Approximations\nP, NP, NP-complete, NP-hard classes, polynomial reductions, approximation algorithms.',
      referenceBooksText:
        "1. Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein, 'Introduction to Algorithms', 4th Edition, MIT Press, 2022.\n2. Jon Kleinberg, Éva Tardos, 'Algorithm Design', 1st Edition, Pearson, 2013.\n3. Sanjoy Dasgupta, Christos Papadimitriou, Umesh Vazirani, 'Algorithms', McGraw-Hill, 2006."
    }
  ];

  for (const course of sampleCourses) {
    const existingCourse = await prisma.courseOffering.findFirst({
      where: {
        courseCode: course.courseCode,
        programme: course.programme,
        batch: course.batch,
        branch: course.branch,
        semester: course.semester
      }
    });

    if (!existingCourse) {
      await prisma.courseOffering.create({ data: course });
      console.log(`[SEED] Created course offering: ${course.courseCode} - ${course.courseName}`);
    } else {
      await prisma.courseOffering.update({
        where: { id: existingCourse.id },
        data: { moduleWiseSyllabusText: course.moduleWiseSyllabusText }
      });
      console.log(`[SEED] Updated course offering syllabus: ${course.courseCode} - ${course.courseName}`);
    }
  }

  console.log('[SEED] Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('[SEED ERROR] Failed to seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
