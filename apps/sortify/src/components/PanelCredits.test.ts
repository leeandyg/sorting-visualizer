import { describe, expect, it } from 'vitest'
import { algorithmInfo, peopleLinks } from '@sortviz/core'
import { ALBUM, TRADITIONAL } from '../library/catalog'
import { artistPhotos } from '../library/photos'
import { creditsFor } from './PanelCredits'

// Only the names: the photos themselves are never loaded.
const photoFiles = Object.keys(import.meta.glob('../../public/artists/*')).map((path) => path.split('/').at(-1))

describe('panel credits', () => {
  it('bills exactly the people the core credits, in the same order', () => {
    for (const { id } of ALBUM.tracks) {
      const billed = creditsFor(id).filter((credit) => !credit.extra).map((credit) => credit.name)
      const by = algorithmInfo[id].credits.by
      expect(billed, id).toEqual(by.length > 0 ? by : [TRADITIONAL])
    }
  })

  it('only names extra contributors that the credits note mentions', () => {
    for (const { id } of ALBUM.tracks) {
      for (const credit of creditsFor(id).filter((c) => c.extra)) {
        expect(algorithmInfo[id].credits.note, id).toContain(credit.name.split(' ').at(-1))
        expect(peopleLinks[credit.name], credit.name).toBeDefined()
      }
    }
  })

  it('states release years that match the core', () => {
    for (const { id } of ALBUM.tracks) {
      const { year } = algorithmInfo[id].credits
      if (year !== undefined) expect(creditsFor(id)[0].fact, id).toBe(`Released ${year}`)
    }
  })

  it('links each person to their article and Traditional to nothing', () => {
    for (const { id } of ALBUM.tracks) {
      for (const credit of creditsFor(id)) {
        expect(credit.href, credit.name).toBe(credit.name === TRADITIONAL ? undefined : peopleLinks[credit.name])
      }
    }
  })

  it('has a stored, credited photo for every photo entry', () => {
    const billed = new Set(ALBUM.tracks.flatMap(({ id }) => creditsFor(id).map((credit) => credit.name)))
    for (const [person, photo] of Object.entries(artistPhotos)) {
      expect(billed.has(person), person).toBe(true)
      expect(photoFiles, person).toContain(photo.file)
      expect(photo.author.trim(), person).not.toBe('')
      expect(photo.licence.trim(), person).not.toBe('')
      expect(photo.licenceUrl, person).toMatch(/^https:\/\//)
      expect(photo.source, person).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
    }
  })
})
