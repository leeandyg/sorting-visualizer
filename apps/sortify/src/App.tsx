import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { algorithmInfo, algorithms, generate, handoffUrl, type Lang, LANGS, parseArray, playTones, readHandoff, record, setVolume, type Shape, SHAPES, sites } from '@sortviz/core'
import { AlbumView, type TrackStats } from './components/AlbumView'
import { AlbumArt, CoverArt } from './components/CoverArt'
import { CoverLightbox } from './components/CoverLightbox'
import { LyricsView } from './components/LyricsView'
import { NowPlayingPanel } from './components/NowPlayingPanel'
import { PlaybackBar } from './components/PlaybackBar'
import { Sidebar } from './components/Sidebar'
import { type Captions, StageView } from './components/StageView'
import { TopBar } from './components/TopBar'
import { ALBUM, albumYears, artistsOf, IN_ORDER, neighbour, shuffledOrder, upNextIndex } from './library/catalog'
import { useKeyboardShortcuts } from './playback/useKeyboardShortcuts'
import { MAX_SPEED, MIN_SPEED, usePlayer } from './playback/usePlayer'
import { useStepSound } from './playback/useStepSound'
import { initSiteSwitch } from './settings/siteSwitch'
import { readUrlState, urlFor } from './settings/urlState'
import { useLikedArrays, useStoredNumber } from './settings/useStored'
import { useStoredChoice } from './settings/useStoredChoice'
import { canGo, current, startHistory, step, visit } from './navigation/history'
import { ViewNav } from './components/ViewNav'
import './App.css'

/** Sixteen values: enough for a song to look and sound like something. */
const DEFAULT_INPUT = [42, 17, 68, 9, 85, 31, 56, 24, 73, 12, 94, 38, 61, 5, 79, 47]
/** Algorithm, array and step from a shared link, read once on load. */
const fromUrl = readUrlState(window.location.search)
const linkedTrack = ALBUM.tracks.findIndex((track) => track.id === fromUrl.algorithm)
/** Speed and play state, when the link came from the Sorting Visualizer's site switcher. */
const handoff = readHandoff(window.location.search, MIN_SPEED, MAX_SPEED)
initSiteSwitch(handoff.arrived, handoff.lang && ['sortify-lang', handoff.lang])
/** How long a finished song holds its last frame before the next one starts, and before a repeat. */
const UP_NEXT_MS = 4000
const REPEAT_MS = 1500

type View = 'album' | 'stage' | 'lyrics'

function App() {
  const [trackIndex, setTrackIndex] = useState(Math.max(linkedTrack, 0))
  const [input, setInput] = useState(fromUrl.input ?? DEFAULT_INPUT)
  const [text, setText] = useState(input.join(', '))
  const [size, setSize] = useState(Math.max(input.length, 2))
  const [shape, setShape] = useState<Shape>('random')
  const [error, setError] = useState<string | null>(null)
  // You always land on the album, even from a link to a song (the song is loaded, ready to play).
  // The one exception: switching over from the Sorting Visualizer while a sort is playing opens
  // the stage, so the sort you were watching carries on in front of you.
  // Views are kept as a trail so the ‹ › buttons can walk it, like pages in a music app.
  const [views, setViews] = useState(() =>
    handoff.playing ? visit(startHistory<View>('album'), 'stage') : startHistory<View>('album'),
  )
  const view = current(views)
  const setView = (next: View) => setViews((h) => visit(h, next))
  // The view the lyrics cover, so closing them goes back to where you were.
  const [behindLyrics, setBehindLyrics] = useState<Exclude<View, 'lyrics'>>('album')
  // The cover shown enlarged: the album's, a song's (by track index), or none.
  const [bigCover, setBigCover] = useState<'album' | number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [captions, setCaptions] = useStoredChoice<Captions>('sortify-captions', ['beginner', 'expert', 'off'], 'beginner')
  const [sound, setSound] = useStoredChoice<'on' | 'off'>('sortify-sound', ['on', 'off'], 'on')
  const [repeat, setRepeat] = useStoredChoice<'on' | 'off'>('sortify-repeat', ['on', 'off'], 'off')
  const [shuffle, setShuffle] = useStoredChoice<'on' | 'off'>('sortify-shuffle', ['on', 'off'], 'off')
  // The order songs follow one another in: the album's, or a shuffled one starting from the loaded song.
  const [order, setOrder] = useState(() => (shuffle === 'on' ? shuffledOrder(Math.max(linkedTrack, 0)) : IN_ORDER))
  const [volume, setVolumeLevel] = useStoredNumber('sortify-volume', 0.8, 0, 1)
  const [lang, setLang] = useStoredChoice<Lang>(
    'sortify-lang',
    LANGS.map((l) => l.id),
    'python',
  )
  const likes = useLikedArrays()

  const track = ALBUM.tracks[trackIndex]
  const algorithm = algorithms[track.id]
  const trace = useMemo(() => record(algorithm, input), [algorithm, input])
  // How every song goes on this array, for the track list. Only the numbers are kept, not the traces.
  const stats = useMemo<TrackStats[]>(
    () =>
      ALBUM.tracks.map(({ id }) => {
        const { frames } = record(algorithms[id], input)
        const { comparisons, writes } = frames[frames.length - 1].counters
        return { steps: frames.length - 1, comparisons, writes }
      }),
    [input],
  )
  const player = usePlayer(trace.frames.length, fromUrl.step, handoff.speed, handoff.playing)
  const frame = trace.frames[player.index]
  const maxValue = Math.max(...input, 1)

  // Keep the address bar pointing at the current song and array, so a refresh or a copied URL keeps them.
  useEffect(() => {
    window.history.replaceState(null, '', urlFor(window.location, { algorithm: track.id, input }))
  }, [track.id, input])

  useEffect(() => {
    document.title = player.playing ? `${track.title} • ${artistsOf(track)}` : 'Sortify'
  }, [player.playing, track])

  useEffect(() => setVolume(volume), [volume])

  const flash = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2500)
  }

  const share = async () => {
    const url = urlFor(window.location, { algorithm: track.id, input, step: player.index })
    window.history.replaceState(null, '', url)
    try {
      await navigator.clipboard.writeText(url)
      flash(`Link to step ${player.index} copied`)
    } catch {
      flash('Copy the link from the address bar')
    }
  }

  /** Starts a song from the top. Picking the one that's already loaded just makes sure it's playing. */
  const playTrack = (index: number, openStage: boolean) => {
    // With the lyrics open, a new song keeps them open (they follow the song), as in a music app.
    if (openStage && view !== 'lyrics') setView('stage')
    if (index === trackIndex) {
      if (!player.playing) player.play()
      return
    }
    setTrackIndex(index)
    player.reset(true)
  }

  const previousTrack = () => {
    // Like a music player: a few steps in, "previous" restarts the song; right at the start, it goes back one.
    const before = neighbour(order, trackIndex, -1)
    if (player.index > 3 || before === null) player.reset(true)
    else playTrack(before, false)
  }

  const openLyrics = () => {
    if (view === 'lyrics') return
    setBehindLyrics(view)
    setView('lyrics')
  }
  const toggleLyrics = () => (view === 'lyrics' ? setView(behindLyrics) : openLyrics())

  // Past the last song in the play order, Next wraps round to the first.
  const nextTrack = () => playTrack(neighbour(order, trackIndex, 1) ?? order[0], false)

  const loadArray = (values: number[]) => {
    setInput(values)
    setText(values.join(', '))
    setError(null)
    player.reset(true)
  }

  const newArray = () => loadArray(generate(shape, size))
  const atDefault = input.join() === DEFAULT_INPUT.join()

  /** Shuffle is the music-player kind: it changes which song comes next, not the array. */
  const toggleShuffle = () => {
    const next = shuffle === 'on' ? 'off' : 'on'
    setShuffle(next)
    setOrder(next === 'on' ? shuffledOrder(trackIndex) : IN_ORDER)
  }

  /** Plays the array typed in the top bar. */
  const run = (e?: FormEvent) => {
    e?.preventDefault()
    // Leave the text field, so Space pauses instead of typing a space into the array.
    if (document.activeElement instanceof HTMLInputElement && document.activeElement.type === 'text') {
      document.activeElement.blur()
    }
    const parsed = parseArray(text)
    if (parsed.error !== undefined) {
      setError(parsed.error)
      return
    }
    setError(null)
    setInput(parsed.values)
    player.reset(true)
  }

  const toggleSound = () => {
    const next = sound === 'on' ? 'off' : 'on'
    setSound(next)
    if (next === 'off') return
    if (volume === 0) setVolumeLevel(0.8)
    // A soft blip confirms sound works (and starts audio, which needs a click or key press).
    playTones([440], 90)
  }

  const changeVolume = (level: number) => {
    setVolumeLevel(level)
    setSound(level > 0 ? 'on' : 'off')
  }

  // Esc steps back out, like closing a full-screen view: lyrics → what was behind them, stage → album.
  const escape = () => {
    if (view === 'lyrics') setView(behindLyrics)
    else if (view === 'stage') setView('album')
  }
  useKeyboardShortcuts(player, trace.frames.length, run, toggleSound, escape)
  useStepSound(sound === 'on', trace, player.index, maxValue)

  // When a song plays through to its end, the next one (or the same one, on repeat) starts after a pause.
  const nextIndex = upNextIndex(trackIndex, repeat === 'on', order)
  const advance = () => {
    if (nextIndex === null) return
    if (nextIndex !== trackIndex) setTrackIndex(nextIndex)
    player.reset(true)
  }
  const advanceRef = useRef(advance)
  useEffect(() => {
    advanceRef.current = advance
  })
  const waiting = player.ended && nextIndex !== null
  const holdMs = nextIndex === trackIndex ? REPEAT_MS : UP_NEXT_MS
  useEffect(() => {
    if (!waiting) return
    const timer = window.setTimeout(() => advanceRef.current(), holdMs)
    return () => window.clearTimeout(timer)
  }, [waiting, holdMs])
  const upNext = waiting && nextIndex !== trackIndex ? ALBUM.tracks[nextIndex] : null

  // Slides take most of a step at slow speeds; past ~30 steps/s they'd only lag, so snap instead.
  const moveMs = player.speed >= 30 ? 0 : Math.min(350, 700 / player.speed)
  const followingIndex = neighbour(order, trackIndex, 1)
  const following = followingIndex === null ? null : ALBUM.tracks[followingIndex]
  const shapeLabel = SHAPES.find((s) => s.id === shape)!.label.toLowerCase()
  const newArrayMakes = `${shapeLabel}, ${size} values`
  const switchHref = handoffUrl(sites.visualizer.url, {
    algorithm: track.id,
    input,
    step: player.index,
    speed: player.speed,
    playing: player.playing,
    lang,
  })

  return (
    <div className="app">
      <TopBar
        text={text}
        onText={setText}
        error={error}
        onSubmit={run}
        onHome={() => setView('album')}
        atHome={view === 'album'}
        settings={{
          shape,
          size,
          onShape: setShape,
          onSize: setSize,
          onNewArray: newArray,
          onReset: atDefault ? undefined : () => loadArray(DEFAULT_INPUT),
          liked: likes.liked,
          onLoad: loadArray,
        }}
        newArrayMakes={newArrayMakes}
        switchHref={switchHref}
      />

      <Sidebar
        current={trackIndex}
        playing={player.playing}
        albumOpen={view === 'album'}
        onOpenAlbum={() => setView('album')}
        onPlayTrack={(index) => playTrack(index, true)}
      />

      {view === 'album' ? (
        <AlbumView
          stats={stats}
          current={trackIndex}
          playing={player.playing}
          arraySize={input.length}
          onTogglePlay={() => (player.playing ? player.pause() : playTrack(trackIndex, true))}
          onPlayTrack={(index) => playTrack(index, true)}
          shuffle={shuffle === 'on'}
          onToggleShuffle={toggleShuffle}
          onNewArray={newArray}
          newArrayMakes={newArrayMakes}
          onOpenCover={() => setBigCover('album')}
        />
      ) : view === 'lyrics' ? (
        <LyricsView
          track={track}
          code={algorithm.code[lang]}
          active={frame.step?.line}
          finished={player.index === trace.frames.length - 1}
          lang={lang}
          onLang={setLang}
          onClose={() => setView(behindLyrics)}
          frames={trace.frames}
          index={player.index}
          onSeek={player.seek}
        />
      ) : (
        <StageView
          track={track}
          algorithm={algorithm}
          trace={trace}
          index={player.index}
          playing={player.playing}
          moveMs={moveMs}
          lang={lang}
          captions={captions}
          onCaptions={setCaptions}
          onOpenAlbum={() => setView('album')}
          onShare={share}
        />
      )}

      <ViewNav
        canBack={canGo(views, -1)}
        canForward={canGo(views, 1)}
        onBack={() => setViews((h) => step(h, -1))}
        onForward={() => setViews((h) => step(h, 1))}
      />

      <div className="overlays">
        {toast && (
          <p className="toast" role="status">
            {toast}
          </p>
        )}
        {upNext && (
          <div className="up-next" role="status">
            <CoverArt track={upNext} />
            <div className="up-next-text">
              <small>Up next</small>
              <strong>{upNext.title}</strong>
            </div>
            <button type="button" className="pill accent" onClick={advance}>
              Play now
            </button>
            <button type="button" className="pill" onClick={player.stay}>
              Stay here
            </button>
            <span className="up-next-timer" style={{ animationDuration: `${UP_NEXT_MS}ms` }} />
          </div>
        )}
      </div>

      <NowPlayingPanel
        track={track}
        algorithm={algorithm}
        frame={frame}
        prev={trace.frames[player.index - 1] ?? null}
        maxValue={maxValue}
        lang={lang}
        onLang={setLang}
        level={captions === 'expert' ? 'expert' : 'beginner'}
        onStage={view === 'stage'}
        onOpenStage={() => setView('stage')}
        next={following}
        onPlayNext={nextTrack}
        onOpenLyrics={openLyrics}
        onOpenCover={() => setBigCover(trackIndex)}
        lyricsOpen={view === 'lyrics'}
      />

      <PlaybackBar
        track={track}
        player={player}
        frameCount={trace.frames.length}
        onPreviousTrack={previousTrack}
        onNextTrack={nextTrack}
        shuffle={shuffle === 'on'}
        onToggleShuffle={toggleShuffle}
        repeat={repeat === 'on'}
        onToggleRepeat={() => setRepeat(repeat === 'on' ? 'off' : 'on')}
        liked={likes.isLiked(input)}
        onToggleLiked={() => likes.toggle(input)}
        sound={sound === 'on'}
        onToggleSound={toggleSound}
        volume={volume}
        onVolume={changeVolume}
        onStage={view === 'stage'}
        onToggleStage={() => setView(view === 'stage' ? 'album' : 'stage')}
        lyricsOpen={view === 'lyrics'}
        onToggleLyrics={toggleLyrics}
      />

      {bigCover !== null && (
        <CoverLightbox
          art={bigCover === 'album' ? <AlbumArt /> : <CoverArt track={ALBUM.tracks[bigCover]} />}
          title={bigCover === 'album' ? ALBUM.title : ALBUM.tracks[bigCover].title}
          subtitle={bigCover === 'album' ? `${ALBUM.artist} • ${albumYears()}` : coverLine(ALBUM.tracks[bigCover])}
          onClose={() => setBigCover(null)}
        />
      )}
    </div>
  )
}

/** "Tony Hoare • 1961": who and when, under a song's enlarged cover. */
function coverLine(track: (typeof ALBUM.tracks)[number]): string {
  const { year } = algorithmInfo[track.id].credits
  return year === undefined ? artistsOf(track) : `${artistsOf(track)} • ${year}`
}

export default App
