/** A freely licensed photo of a billed person, stored in `public/artists/` so nothing is hotlinked. */
export interface ArtistPhoto {
  /** The file name in `public/artists/`. */
  file: string
  /** What the photo shows, for its alt text. */
  alt: string
  /** The Wikimedia Commons file page the photo was taken from; the credit links here. */
  source: string
  author: string
  licence: string
  licenceUrl: string
  /** CSS `object-position` that keeps the face in the card's wide frame. */
  position: string
}

/**
 * Photos by person, as the credits name them. Only public-domain or Creative Commons files, each
 * checked on its Commons page. J. W. J. Williams and Nico Lomuto have no free photo, and Robert
 * Floyd's is a non-free upload, so they keep the song's cover.
 */
export const artistPhotos: Record<string, ArtistPhoto> = {
  'John von Neumann': {
    // Resized to 800 px and cropped just below the tie, converted to WebP.
    file: 'john-von-neumann.webp',
    alt: 'Portrait of John von Neumann in a suit and patterned tie, 1956',
    source: 'https://commons.wikimedia.org/wiki/File:HD.3F.191_(11239892036).jpg',
    author: 'U.S. Department of Energy',
    licence: 'Public domain',
    // A work of the U.S. federal government, so not under copyright.
    licenceUrl: 'https://commons.wikimedia.org/wiki/Template:PD-USGov-DOE',
    position: '50% 55%',
  },
  'Tony Hoare': {
    // Resized to 800 px, converted to WebP.
    file: 'tony-hoare.webp',
    alt: 'Tony Hoare smiling, in glasses and a beige jacket, 2011',
    source: 'https://commons.wikimedia.org/wiki/File:Sir_Tony_Hoare_IMG_5125.jpg',
    author: 'Rama',
    licence: 'CC BY-SA 2.0 FR',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/2.0/fr/deed.en',
    position: '50% 58%',
  },
}

/** Where a photo is served from, respecting the app's base path. */
export const photoUrl = (photo: ArtistPhoto) => `${import.meta.env.BASE_URL}artists/${photo.file}`
