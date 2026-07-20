import { PrismaClient } from '@prisma/client';
import { MOCK_FILMS, MOCK_ARTICLES } from '../src/lib/mock-data';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Seeding database...');
  
  // Seed Films
  for (const film of MOCK_FILMS) {
    await prisma.media.upsert({
      where: { slug: film.slug },
      update: {},
      create: {
        title: film.title,
        slug: film.slug,
        type: 'FILM',
        description: film.synopsisShort,
        videoUrl: film.trailerUrl,
        coverImage: film.thumbnailUrl,
        published: film.status === 'published',
      },
    });
    console.log(`Created film: ${film.title}`);
  }

  // Seed Articles
  for (const article of MOCK_ARTICLES) {
    await prisma.media.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        title: article.title,
        slug: article.slug,
        type: 'JOURNALISM',
        description: article.excerpt,
        coverImage: article.mainImage,
        published: article.status === 'published',
      },
    });
    console.log(`Created article: ${article.title}`);
  }

  // Create an Admin user
  const adminEmail = 'admin@dontskiphumanity.com';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'DSH Admin',
      role: 'ADMIN',
      // In a real app we hash the password, but for now this is just a placeholder
      // since NextAuth handles actual authentication flow
    },
  });
  console.log(`Created Admin user: ${adminEmail}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
