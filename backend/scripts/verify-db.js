import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  errorFormat: 'pretty'
});

async function verifyDatabase() {
  console.log('========================================================');
  console.log('🔍 JalRakshak PostgreSQL Database Verification');
  console.log('========================================================');

  try {
    console.log('📡 Testing connection to PostgreSQL via Prisma ORM...');
    await prisma.$connect();
    
    // Check raw heartbeat
    const result = await prisma.$queryRaw`SELECT current_database() as db, version() as pg_version, now() as current_time`;
    console.log(`✅ Connected successfully to database: "${result[0].db}"`);
    console.log(`ℹ️ PostgreSQL Engine: ${result[0].pg_version.split(' on ')[0]}`);

    console.log('\n📊 Querying all 7 Core Relational Models:');
    console.log('--------------------------------------------------------');

    const [
      userCount,
      villageCount,
      membershipCount,
      missionCount,
      progressCount,
      simulationCount,
      groundwaterCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.village.count(),
      prisma.villageMembership.count(),
      prisma.mission.count(),
      prisma.missionProgress.count(),
      prisma.simulationRun.count(),
      prisma.groundwaterRecord.count()
    ]);

    console.log(` 1. User                 : ${userCount} records`);
    console.log(` 2. Village              : ${villageCount} records`);
    console.log(` 3. VillageMembership    : ${membershipCount} records`);
    console.log(` 4. Mission              : ${missionCount} records`);
    console.log(` 5. MissionProgress      : ${progressCount} records`);
    console.log(` 6. SimulationRun        : ${simulationCount} records`);
    console.log(` 7. GroundwaterRecord    : ${groundwaterCount} records`);
    console.log('--------------------------------------------------------');
    console.log('🎉 Verification passed: All models are mapped and queryable.');

  } catch (error) {
    console.error('\n❌ Database Verification Failed:');
    console.error('Error Code:   ', error.code || 'UNKNOWN');
    console.error('Error Message:', error.message);
    console.log('\n💡 Troubleshooting Guide:');
    console.log('1. Verify PostgreSQL service is running: Run "Get-Service postgresql-x64-18" in Admin PowerShell.');
    console.log('2. If stopped, start it: Run "Start-Service postgresql-x64-18" or "net start postgresql-x64-18".');
    console.log('3. Verify DATABASE_URL in backend/.env has the correct user, password, and port (default 5432).');
    console.log('4. Ensure the database "jalrakshak" exists: Run "createdb -U postgres jalrakshak".');
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database disconnected safely.');
  }
}

verifyDatabase();
