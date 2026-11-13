# Sortify

A music player for sorting algorithms. The album is "Sorting Algorithms", each song is an algorithm,
and pressing play sorts an array: the bars are the video, the notes are the music, and the code scrolls
by as lyrics. It is the playful sibling of the [Sorting Visualizer](../visualizer), built on the same
engine. Not affiliated with Spotify.

## What's in it

- **The album:** seven songs (bubble, selection, insertion, merge, quick, quick's Lomuto remix, heap),
  credited to their inventors where there is one and to "Traditional" where there isn't. The track list
  shows each song's length, comparisons and writes for the current array.
- **The stage:** the array as bars, with captions that explain each step (beginner, expert or off), and a
  tree view for heap sort.
- **Lyrics:** the code in Python, JavaScript, Java or C++, with the running line lit, plus the variables
  and counters.
- **The player:** play, step back and forward, previous and next song, a scrubber, speed, volume and
  repeat. When a song ends, the next one starts after a short "Up next" pause.
- **Your own arrays:** type one into the top bar, or shuffle a new one (random, nearly sorted, reversed,
  few unique or sorted, up to 100 values). The heart saves an array for later.
- **Links:** Share copies a link to the exact step, in the same format the Sorting Visualizer uses.

One step of a sort is shown as one second of a song, so a 178-step sort is a 2:58 track.

## Keyboard

| Key | Does |
|---|---|
| Space | Play or pause |
| ← / → | Step back or forward (Shift: 5 steps) |
| Q / E | Start or end of the song |
| − / = | Slower or faster |
| M | Sound on or off |
| Enter | Play the array in the top bar |
| Shift+Enter | Expand the array field |

## Running it

From the repo root:

```sh
npm install
npm run dev:sortify    # http://localhost:5174
```
