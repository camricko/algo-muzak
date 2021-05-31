const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })
createWaveCanvas({ element: 'section', analyser: fft })


// state variables
let prevVol
let prevFreq
let prevTone
let lvl
let freq
let myNotes = []
let savedNotes
let savedItems = []
let savedCount = 0

//i.e. one octave of notes going up from A4
const notesA4 = [
  440.00, //A4
  466.16, //A#
  493.88, //B
  523.25, //C
  554.37, //C#
  587.33, //D
  622.25, //D#
  659.25, //E
  698.46, //F
  739.99, //F#
  783.99, //G
  830.61, //G#
  880.00, //A5
]
const notesA5 = notesA4.map(x => x * 2)
const notesA6 = notesA5.map(x => x * 2)

var major = [0, 2, 4, 5, 7, 9, 11, 12]
var minor = [0, 2, 3, 5, 7, 8, 10, 12, 13, 13]


function adsr (opts) {
  const param = opts.param
  const peak = opts.peak || 1
  const hold = opts.hold || 0.8
  const time = opts.time || ctx.currentTime

  const a = opts.attack || opts.duration / 10
  const d = opts.decay || opts.duration / 6
  const s = opts.sustain || (opts.duration / 6)
  const r = opts.release || (opts.duration / 12)

  const initVol = param.value
  param.setValueAtTime(initVol, time)
  param.linearRampToValueAtTime(peak, time + a)
  param.linearRampToValueAtTime(hold, time + a + d)
  param.linearRampToValueAtTime(hold, time + a + d + s)
  param.linearRampToValueAtTime(initVol, time + a + d + s + r)
}
function tone (pitch, type, time, duration, volume) {
  const ty = type || 'sine'
  const t = time || ctx.currentTime
  const dur = duration || 0.3
  const vol = volume || 0.001
  const p = pitch || Math.floor(Math.random()*220 + 550)

  osc = new OscillatorNode(ctx, {type: ty, frequency: p})
  lvl = new GainNode(ctx, {gain: vol})

  osc.connect(lvl)
  lvl.connect(ctx.destination)
  osc.connect(fft)
  osc.start(t)
  osc.stop(t + dur)
  adsr({
    param: lvl.gain,
    time: t,
    duration: dur
  })

  prevTone = osc.frequency.value
}
function step (rootFreq, steps) {
  const startingNote = rootFreq || 440
  const a = Math.pow(2, 1 / 12)
  const nextStep = startingNote * Math.pow(a, steps)

  return Math.round(nextStep * 100) / 100
}
function draw() {
  setTimeout(() => draw(), 1000/12)
  const volHTML = document.getElementById("volume")
  const vol = Math.round(lvl.gain.value * 100)
  const freqHTML = document.getElementById('frequency')
  const freq = osc.frequency.value

  vol === prevVol ? null : volHTML.innerHTML = `Volume: ${vol}`
  freq === prevFreq ? null : freqHTML.innerHTML = `Frequency: ${freq}`

  prevVol = vol
  prevFreq = freq

}

function beep() {
  myNotes = [] //make this part modular
  tone()
  myNotes[0] = osc.frequency.value //make this part modular
}

function boop() {
  myNotes = [] //make this part modular
  tone(step(prevTone, 1))
  myNotes[0] = osc.frequency.value //make this part modular
}

function algo(speed, whatkey, whatoctave) {
  myNotes = [] //make this part modular
  const bpm = speed || 330
  const key = whatkey || major
  const octave = whatoctave || notesA4

  const beat = (1 / (bpm / 60))

  for (var i = 0; i < 10; i++) {

    const idx = Math.floor(Math.random() * (key.length + 1 - 0.0001))
    const note = octave[idx]

    tone(note, 'sine', ctx.currentTime + beat * i, 0.3)
    myNotes[i] = note //make this part modular
  }
}

function algo2(speed, whatkey, whatoctave) {
  myNotes = [] //make this part modular
  const bpm = speed || 330
  const key = whatkey || major
  const octave = whatoctave || notesA4

  const beat = (1 / (bpm / 60))

  for (var i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * (key.length + 1 - 0.0001))
    const note = octave[idx]

    tone(note, 'sine', ctx.currentTime + beat * i, 0.3)
    myNotes[i] = note //make this part modular
  }
}


function save() {
  savedNotes = myNotes.slice()

  savedItems[savedCount] = savedNotes
  savedCount++

  console.log('saved!')
}

function playback(speed) {
  const bpm = speed || 330
  const beat = (1 / (bpm / 60))
  let start = ctx.currentTime

  for (var i = 0; i < savedItems.length; i++) {
    for (var j = 0; j < savedItems[i].length; j++) {
      // tone(savedItems[i][j], 'sine', ctx.currentTime + beat * j + (i * savedItems[i].length * 0.3), 0.3)
      tone(savedItems[i][j], 'sine', start + beat * j, 0.3)
    }
    start += savedItems[i].length * 0.3
  }
}








document.getElementById('play').addEventListener('click', function() {
  beep()
})
document.getElementById('step').addEventListener('click', function() {
  boop()
})
document.getElementById('algo').addEventListener('click', function() {
  algo()
})
document.getElementById('algo2').addEventListener('click', function() {
  algo2()
})
document.getElementById('save').addEventListener('click', function() {
  save()
})
document.getElementById('playback').addEventListener('click', function() {
  playback()
})


draw()
