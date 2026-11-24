import { PrismaClient, Role, Difficulty, MissionCategory, MissionStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting JalRakshak PostgreSQL development database seed...');

  // 1. Clean existing records in referential order (safe for dev)
  await prisma.groundwaterRecord.deleteMany();
  await prisma.simulationRun.deleteMany();
  await prisma.missionProgress.deleteMany();
  await prisma.villageMembership.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.village.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing development database records.');

  // 2. Create Development Demo Users (safely hashed passwords)
  const saltRounds = 10;
  const demoStudentPasswordHash = await bcrypt.hash('DevStudent123!', saltRounds);
  const demoTeacherPasswordHash = await bcrypt.hash('DevTeacher123!', saltRounds);
  const demoAdminPasswordHash = await bcrypt.hash('DevAdmin123!', saltRounds);

  const studentUser = await prisma.user.create({
    data: {
      name: 'Aarav Sharma (Dev Student)',
      email: 'student.demo@jalrakshak.local',
      passwordHash: demoStudentPasswordHash,
      role: Role.STUDENT
    }
  });

  const teacherUser = await prisma.user.create({
    data: {
      name: 'Dr. Sunita Rao (Dev Teacher)',
      email: 'teacher.demo@jalrakshak.local',
      passwordHash: demoTeacherPasswordHash,
      role: Role.TEACHER
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin (Dev)',
      email: 'admin.demo@jalrakshak.local',
      passwordHash: demoAdminPasswordHash,
      role: Role.ADMIN
    }
  });

  console.log(`👤 Created 3 development users: Student (${studentUser.email}), Teacher (${teacherUser.email}), Admin (${adminUser.email})`);

  // 3. Create Demo Village (Rampur Watershed)
  const demoVillage = await prisma.village.create({
    data: {
      name: 'Rampur Watershed',
      description: 'A semi-arid agricultural community situated in the Deccan basalt plateau facing rapid aquifer decline due to post-monsoon sugarcane irrigation.',
      region: 'Ahmednagar District, Maharashtra (Semi-Arid Basaltic Hard-Rock Terrain)'
    }
  });

  console.log(`🏡 Created demo village: ${demoVillage.name} (${demoVillage.id})`);

  // 4. Enroll Student in Village
  const membership = await prisma.villageMembership.create({
    data: {
      userId: studentUser.id,
      villageId: demoVillage.id
    }
  });

  console.log(`🤝 Enrolled student in ${demoVillage.name} (Membership ID: ${membership.id})`);

  // 5. Create Educational Missions across key groundwater categories
  const missionsData = [
    {
      title: 'Aquifer Infiltration Diagnostics',
      description: 'Analyze the soil permeation rate of black cotton soil vs. weathered basalt to estimate potential monsoon recharge in Rampur.',
      difficulty: Difficulty.BEGINNER,
      category: MissionCategory.GROUNDWATER,
      points: 100
    },
    {
      title: 'Community Check Dam Construction',
      description: 'Position and design a series of check dams along the seasonal stream to capture surface runoff and elevate the local water table by 3 meters.',
      difficulty: Difficulty.INTERMEDIATE,
      category: MissionCategory.RAINWATER_HARVESTING,
      points: 250
    },
    {
      title: 'Micro-Irrigation Crop Transition',
      description: 'Transition 40 hectares of water-intensive flood-irrigated sugarcane to drip-irrigated drought-resistant millets and pulses.',
      difficulty: Difficulty.ADVANCED,
      category: MissionCategory.IRRIGATION,
      points: 400
    },
    {
      title: 'Agricultural Runoff & Nitrate Abatement',
      description: 'Establish biological buffer strips around village community wells to mitigate agricultural fertilizer leaching and preserve potable water standards.',
      difficulty: Difficulty.INTERMEDIATE,
      category: MissionCategory.WATER_POLLUTION,
      points: 200
    },
    {
      title: 'Borewell Extraction Quota Policy',
      description: 'Formulate an enforceable village water budget setting extraction caps on deep tube-wells to prevent cone-of-depression interference.',
      difficulty: Difficulty.ADVANCED,
      category: MissionCategory.SUSTAINABLE_USAGE,
      points: 500
    }
  ];

  const createdMissions = [];
  for (const m of missionsData) {
    const mission = await prisma.mission.create({ data: m });
    createdMissions.push(mission);
  }

  console.log(`🎯 Created ${createdMissions.length} educational missions across all syllabus categories.`);

  // 6. Record Initial Mission Progress for Student
  await prisma.missionProgress.create({
    data: {
      userId: studentUser.id,
      missionId: createdMissions[0].id,
      status: MissionStatus.IN_PROGRESS,
      progress: 35.0
    }
  });

  console.log('📈 Initialized demo student mission progress.');

  // 7. Seed Initial Baseline Simulation Run & Snapshot (Educational Model)
  const demoRun = await prisma.simulationRun.create({
    data: {
      userId: studentUser.id,
      villageId: demoVillage.id,
      initialStorage: 150000.0, // m3 (Simulated aquifer volume)
      finalStorage: 162500.0,   // m3
      rainfall: 620.0,          // mm
      recharge: 45000.0,        // m3
      extraction: 28000.0,      // m3
      losses: 4500.0,           // m3
      sustainabilityScore: 78.5
    }
  });

  await prisma.groundwaterRecord.create({
    data: {
      villageId: demoVillage.id,
      simulationRunId: demoRun.id,
      storageIndex: 0.65,
      recharge: 3750.0,
      extraction: 2330.0,
      waterQualityIndex: 82.0
    }
  });

  console.log('📊 Seeded baseline educational simulation run and groundwater snapshot.');
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
