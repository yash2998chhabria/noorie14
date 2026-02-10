export interface PhotoEntry {
  id: string;
  src: string;
  thumbnail: string;
  caption: string;
  year: number;
}

// Photo manifest — replace these with real photos
// Place photos in public/photos/year1/ through year4/
export const photos: PhotoEntry[] = [
  // Year 1
  { id: 'year1-photo1', src: '/photos/year1/photo1.jpg', thumbnail: '/photos/year1/photo1.jpg', caption: 'Our first adventure together', year: 1 },
  { id: 'year1-photo2', src: '/photos/year1/photo2.jpg', thumbnail: '/photos/year1/photo2.jpg', caption: 'The smile that started it all', year: 1 },
  { id: 'year1-photo3', src: '/photos/year1/photo3.jpg', thumbnail: '/photos/year1/photo3.jpg', caption: 'Where our story began', year: 1 },
  { id: 'year1-milestone', src: '/photos/year1/milestone.jpg', thumbnail: '/photos/year1/milestone.jpg', caption: 'Year One — The Beginning', year: 1 },

  // Year 2
  { id: 'year2-photo1', src: '/photos/year2/photo1.jpg', thumbnail: '/photos/year2/photo1.jpg', caption: 'Exploring the world together', year: 2 },
  { id: 'year2-photo2', src: '/photos/year2/photo2.jpg', thumbnail: '/photos/year2/photo2.jpg', caption: 'Our favorite place', year: 2 },
  { id: 'year2-photo3', src: '/photos/year2/photo3.jpg', thumbnail: '/photos/year2/photo3.jpg', caption: 'Making memories everywhere', year: 2 },
  { id: 'year2-milestone', src: '/photos/year2/milestone.jpg', thumbnail: '/photos/year2/milestone.jpg', caption: 'Year Two — Adventures', year: 2 },

  // Year 3
  { id: 'year3-photo1', src: '/photos/year3/photo1.jpg', thumbnail: '/photos/year3/photo1.jpg', caption: 'Through every season', year: 3 },
  { id: 'year3-photo2', src: '/photos/year3/photo2.jpg', thumbnail: '/photos/year3/photo2.jpg', caption: 'Cozy moments together', year: 3 },
  { id: 'year3-photo3', src: '/photos/year3/photo3.jpg', thumbnail: '/photos/year3/photo3.jpg', caption: 'Our love grows stronger', year: 3 },
  { id: 'year3-milestone', src: '/photos/year3/milestone.jpg', thumbnail: '/photos/year3/milestone.jpg', caption: 'Year Three — Through Everything', year: 3 },

  // Year 4
  { id: 'year4-photo1', src: '/photos/year4/photo1.jpg', thumbnail: '/photos/year4/photo1.jpg', caption: 'Written in the stars', year: 4 },
  { id: 'year4-photo2', src: '/photos/year4/photo2.jpg', thumbnail: '/photos/year4/photo2.jpg', caption: 'Our forever moment', year: 4 },
  { id: 'year4-photo3', src: '/photos/year4/photo3.jpg', thumbnail: '/photos/year4/photo3.jpg', caption: 'Love that shines bright', year: 4 },
  { id: 'year4-photo4', src: '/photos/year4/photo4.jpg', thumbnail: '/photos/year4/photo4.jpg', caption: 'Together, always', year: 4 },
  { id: 'year4-milestone', src: '/photos/year4/milestone.jpg', thumbnail: '/photos/year4/milestone.jpg', caption: 'Year Four — Our Forever', year: 4 },
];

export function getPhotoById(id: string): PhotoEntry | undefined {
  return photos.find(p => p.id === id);
}

export function getPhotosByYear(year: number): PhotoEntry[] {
  return photos.filter(p => p.year === year);
}
