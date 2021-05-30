const ctx = new (window.AudioContext || window.webkitAudioContext)()
const fft = new AnalyserNode(ctx, { fftSize: 2048 })
createWaveCanvas({ element: 'section', analyser: fft })


// state variables
let lvlMirror
let oscMirror
let prevVol
let prevFreq
let prevTone

let notes = []

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

  const osc = new OscillatorNode(ctx, {type: ty, frequency: p})
  const lvl = new GainNode(ctx, {gain: vol})

  lvlMirror = lvl

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
function step (origin, steps) {
  const startingNote = origin || 440
  const a = Math.pow(2, 1 / 12)
  const nextStep = startingNote * Math.pow(a, steps)

  return Math.round(nextStep * 100) / 100
}
function draw() {
  setTimeout(() => draw(), 500)
  const volHTML = document.getElementById("volume")
  const vol = Math.round(lvlMirror.gain.value * 100)
  const freqHTML = document.getElementById('frequency')
  const freq = oscMirror.frequency.value

  vol === prevVol ? null : volHTML.innerHTML = `Volume: ${vol}`
  freq === prevFreq ? null : freqHTML.innerHTML = `Frequency: ${freq}`

  prevVol = vol
  prevFreq = freq

}




document.getElementById('play').addEventListener('click', function() {
  tone()
})

document.getElementById('step').addEventListener('click', function() {
  for (var i = 0; i < 4; i++) {
    const rand = Math.floor(Math.random()*220 + 550)
    tone(rand, 'sine', ctx.currentTime + i, 0.3)
  }
})


draw()
