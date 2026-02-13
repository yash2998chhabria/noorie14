export interface PhotoEntry {
  id: string;
  src: string;
  thumbnail: string;
  caption: string;
  year: number;
  mediaType: 'photo' | 'video';
}

// Photo manifest — replace these with real photos
// Place photos in public/photos/year1/ through year4/
export const photos: PhotoEntry[] = [
  // Year 1 (2022–2023)
  { id: 'year1-photo1', src: '/photos/year1/early_days.jpeg', thumbnail: '/photos/year1/early_days.jpeg', caption: 'The DM that started it all', year: 1, mediaType: 'photo' },
  { id: 'year1-photo2', src: '/photos/year1/first_trip_LA.jpeg', thumbnail: '/photos/year1/first_trip_LA.jpeg', caption: 'Matched on Tinder, vibes on point', year: 1, mediaType: 'photo' },
  { id: 'year1-photo3', src: '/photos/year1/ucsc_bus.jpeg', thumbnail: '/photos/year1/ucsc_bus.jpeg', caption: 'UCSC days — where our story began', year: 1, mediaType: 'photo' },
  { id: 'year1-milestone', src: '/photos/year1/video_ucsc.jpeg', thumbnail: '/photos/year1/video_ucsc.jpeg', caption: 'Year One — From a DM to falling hard', year: 1, mediaType: 'photo' },

  // Year 2 (2023–2024)
  { id: 'year2-photo1', src: '/photos/year2/year2_rave.jpeg', thumbnail: '/photos/year2/year2_rave.jpeg', caption: 'Portola Festival — that SF magic', year: 2, mediaType: 'photo' },
  { id: 'year2-photo2', src: '/photos/year2/just_her_birthday.jpeg', thumbnail: '/photos/year2/just_her_birthday.jpeg', caption: 'Lost in the music together', year: 2, mediaType: 'photo' },
  { id: 'year2-photo3', src: '/photos/year2/just_a_cute_picture_at_a_party.jpeg', thumbnail: '/photos/year2/just_a_cute_picture_at_a_party.jpeg', caption: 'Concert nights with my favorite person', year: 2, mediaType: 'photo' },
  { id: 'year2-milestone', src: '/photos/year2/2_years_back_in_india.jpeg', thumbnail: '/photos/year2/2_years_back_in_india.jpeg', caption: 'Year Two — Our soundtrack, our adventure', year: 2, mediaType: 'photo' },

  // Year 3 (2024–2025)
  { id: 'year3-photo1', src: '/photos/year3/first_fred_again_rave.jpeg', thumbnail: '/photos/year3/first_fred_again_rave.jpeg', caption: 'San Jose drives, always worth it for you', year: 3, mediaType: 'photo' },
  { id: 'year3-photo2', src: '/photos/year3/just_her_santacruz_beach.jpeg', thumbnail: '/photos/year3/just_her_santacruz_beach.jpeg', caption: 'FaceTime nights until we fell asleep', year: 3, mediaType: 'photo' },
  { id: 'year3-photo3', src: '/photos/year3/random_fair_we_went_to_shes_in_it.jpeg', thumbnail: '/photos/year3/random_fair_we_went_to_shes_in_it.jpeg', caption: 'Making it work, no matter what', year: 3, mediaType: 'photo' },
  { id: 'year3-milestone', src: '/photos/year3/us_in_my_san_jose_house.jpeg', thumbnail: '/photos/year3/us_in_my_san_jose_house.jpeg', caption: 'Year Three — Distance never stood a chance', year: 3, mediaType: 'photo' },

  // Year 4 (2025–2026)
  { id: 'year4-photo1', src: '/photos/year4/together_in_london.jpeg', thumbnail: '/photos/year4/together_in_london.jpeg', caption: 'Apartment hunting — finding our place', year: 4, mediaType: 'photo' },
  { id: 'year4-photo2', src: '/photos/year4/halloween_in_sanjo.jpeg', thumbnail: '/photos/year4/halloween_in_sanjo.jpeg', caption: 'Twin Peaks — home, finally together', year: 4, mediaType: 'photo' },
  { id: 'year4-photo3', src: '/photos/year4/sf_date_night.jpeg', thumbnail: '/photos/year4/sf_date_night.jpeg', caption: 'That view from our apartment', year: 4, mediaType: 'photo' },
  { id: 'year4-photo4', src: '/photos/year4/fred_again_again_sf.jpeg', thumbnail: '/photos/year4/fred_again_again_sf.jpeg', caption: 'Paso Robles bound — anniversary vibes', year: 4, mediaType: 'photo' },
  { id: 'year4-photo5', src: '/photos/year4/we_took_nyxie_to_the_beach.jpeg', thumbnail: '/photos/year4/we_took_nyxie_to_the_beach.jpeg', caption: "Nyxie's first beach day with us", year: 4, mediaType: 'photo' },
  { id: 'year4-milestone', src: '/photos/year4/us_in_our_smoking_spot_twin_peaks.jpeg', thumbnail: '/photos/year4/us_in_our_smoking_spot_twin_peaks.jpeg', caption: 'Year Four — Our place, our forever', year: 4, mediaType: 'photo' },
];

export function getPhotoById(id: string): PhotoEntry | undefined {
  return photos.find(p => p.id === id);
}

export function getPhotosByYear(year: number): PhotoEntry[] {
  return photos.filter(p => p.year === year);
}
