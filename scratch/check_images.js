const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hotels = await prisma.hotel.findMany({
    take: 5,
    select: { id: true, name: true, coverImage: true }
  });
  console.log('Hotels:', JSON.stringify(hotels, null, 2));

  const rooms = await prisma.room.findMany({
    take: 5,
    include: { images: true }
  });
  console.log('Rooms:', JSON.stringify(rooms, null, 2));

  const users = await prisma.user.findMany({
    take: 5,
    select: { id: true, name: true, image: true }
  });
  console.log('Users:', JSON.stringify(users, null, 2));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
