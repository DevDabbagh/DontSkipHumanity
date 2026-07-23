"use server";

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getHeroFilms() {
  try {
    const films = await prisma.media.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 7, // Limit to 7 items for the slider
    });

    return films.map(film => ({
      type: film.type === 'FILM' ? 'Documentary' : film.type === 'JOURNALISM' ? 'Journalism' : film.type === 'ACADEMY' ? 'Academy' : 'Youtube Series',
      typeColor: film.type === 'FILM' ? 'text-[#D81B60]' : 'text-[#9B59B6]',
      title: film.title,
      slug: film.slug,
      image: film.coverImage || '/images/default.jpg',
    }));
  } catch (error) {
    console.error("Error fetching films:", error);
    return [];
  }
}
