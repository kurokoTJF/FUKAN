// classes.js
// difficult to split files

const CharID = {
  Player: 0,
  Enemy: 1,
}

class Player {
  constructor() {
    console.log("player online")
    this.position = { x: 1, y: 1 }
    this.HP = 100
    this.ID = CharID.Player
    this.stance = 100
    this.isFree = true
    this.state = {
      moving: false,
      usingChip: false,
      buffed: false,
      idle: false,
      attack: false,
    }
    this.moveGridStop = 20
    this.chipName = ""
    //this.position.y=10
    this.counter = null
    this.renderer = new MovieRenderer(this)
  }

  cst(_state) {
    if (!this.state[_state]) { this.state[_state] = true; return true; }

    return false
  }

  est(state) {
    if (this.state[state]) { this.state[state] = false; return true; }
    return false
  }

  #startMove(_x, _y) {
    if (
      this.position.x + _x < 1 ||
      this.position.x + _x > 3 ||
      this.position.y + _y < 1 ||
      this.position.y + _y > 3
    )
      return
    if (this.cst('moving')) {
      this.counter = GM._addCounterGen({
        _endtime: this.moveGridStop,
        _msg: "[GM]player moving",
        _endCall: () => { },
      })
      this.counter.processCall = () => {
        if (this.counter.time == this.moveGridStop / 2) { this._moveGrid(_x, _y); }
        else if (this.counter.time == this.moveGridStop) { this.est('moving'); this.counter.end=true;this.counter = null; }
      }
    }
  }
  _moveGrid(_x, _y) {
    this.position.x += _x
    this.position.y += _y
  }

  resetCounter0() {
    log('reset counter')
    if (this.counter) { this.counter.end = true; this.counter = null; }
  }

  startUseChip() {
    if (chip_selected.length < 1) { console.log("no chip selected"); return; }
    if (this.cst('usingChip')) {

      // use the first chip
      this.chipName = chip_selected[0].name
      chip_selected.splice(0, 1)
      //this.counter = GM._addCounter(40, "[GM]player using chip", () => this._endUseChip())
      this.counter = GM._addCounterGen({
        _endtime: 100,
        _msg: "[GM]player using chip",
        _endCall: () => this._endUseChip(),
        _gen_list: [
          {
            time: 40,
            call: () =>
              GM._addCounterGen({
                _endtime: 30,
                _msg: "qte counting...",
                _endCall: () => player.HP -= 25,
                _qteCall: () => {
                  player.state["buffed"] = true
                  GM.addSPCounter()
                  enemy.HP -= 20
                  log("PERFECT!")
                },
              }),
          },
        ],
      })
    }
  }
  _endUseChip() {
    this.est('usingChip')
    this.resetCounter0()
  }

  endAttack() {
    this.est('attack')
    this.resetCounter0()

  }
  startAtk() {
    if (this.cst('attack')) {
      this.resetCounter0()
      this.counter = GM._addCounterGen({
        _endtime: 30,
        _msg: 'attaking',
        _processCall:()=>{},
        _endCall: () => { log('end atk'); this.endAttack();enemy.HP-=2;}
      })
      this.counter.processCall=()=>{
        if(keys.atk.pressed && this.counter.time>this.counter.end_time/2) 
          this.counter.time = 0
      }
    }
  }

  _handleInput() {
    if (this.ID == CharID.Enemy) return
    if (!this.state['idle']) return
    if (keys.atk.pressed) { log('atk'); this.startAtk(); }
    if (keys.use_chip.pressed) {
      this.startUseChip()
    }

    if (keys.down.pressed) {
      this.#startMove(0, 1)
    }
    if (keys.up.pressed) {
      this.#startMove(0, -1)
    }
    if (keys.left.pressed) {
      this.#startMove(-1, 0)
    }
    if (keys.right.pressed) {
      this.#startMove(1, 0)
    }

    if (this.position.y > 3) this.position.y = 3
    else if (this.position.y < 1) this.position.y = 1
    if (this.position.x > 3) this.position.x = 3
    else if (this.position.x < 1) this.position.x = 1
  }

  _setFree() {
    this.state["moving"] = false
  }

  update() {
    if (this.ID == CharID.Enemy) return
    //key event
    //Counterの更新はこの時点で済んでる
    this._handleInput()
    //change the postion

    // back to idle
    let _state_true = 0
    for (let s in this.state) {
      if (this.state[s]) 
        if (!['buffed','idle'].includes(s)) { 
          _state_true++;
            console.log('current state: '+s); 
        }
    }
    if (_state_true==0) {
      if (this.cst('idle')) {
        console.log(_state_true + ' back to idle')
      }
    } else {
      if (this.est('idle')) {
        console.log(_state_true + ' end idle')
      }
    }

  }

  draw() {
    const temp_draw = () =>
      c.fillRect(
        ((this.position.x - 1) * canvas.width) / 6 + 10,
        (this.position.y * canvas.height) / 6 + 40,
        20,
        tileSize,
      )
    const temp_print = (msg) =>
      c.fillText(
        msg,
        10 + ((this.position.x - 1) * canvas.width) / 6,
        (this.position.y * canvas.height) / 6 + 40 + 10,
      )
    const temp_draw_gauge = (_counter) => {
      c.fillStyle = "rgba(0,0,0,1)"
      c.fillRect(
        ((this.position.x - 1) * canvas.width) / 6 + 10,
        (this.position.y * canvas.height) / 6 + 40 + tileSize,
        tileSize,
        5,
      )
      c.fillStyle = "rgba(255,0,0,1)"
      c.fillRect(
        ((this.position.x - 1) * canvas.width) / 6 + 10,
        (this.position.y * canvas.height) / 6 + 40 + tileSize,
        (_counter.time / _counter.end_time) * tileSize,
        5,
      )
    }
    const temp_draw_gauge2 = (_current, _max) => {
      c.fillStyle = "rgba(0,0,0,1)"
      c.fillRect(
        ((this.position.x - 1) * canvas.width) / 6 + 10,
        (this.position.y * canvas.height) / 6 + 10,
        tileSize,
        5,
      )
      c.fillStyle = "rgba(255,0,0,1)"
      c.fillRect(
        ((this.position.x - 1) * canvas.width) / 6 + 10,
        (this.position.y * canvas.height) / 6 + 10,
        (_current / _max) * tileSize,
        5,
      )
    }

    temp_draw_gauge2(this.HP, 100)
    if (this.state["buffed"]) {
      c.fillStyle = "rgb(251, 255, 0)"
      c.fillRect(
        ((this.position.x - 1) * canvas.width) / 6 + 10,
        (this.position.y * canvas.height) / 6 + 20,
        tileSize,
        5,
      )
    }



    if (this.state["usingChip"]) {
      c.fillStyle = "rgb(189, 221, 189)"
      temp_draw()
      c.fillStyle = "rgb(255, 255, 255)"
      temp_print("using chips")
    } else if (this.state["moving"]) {
      c.fillStyle = "rgb(92, 144, 240)"
      temp_draw()
      c.fillStyle = "rgba(255,255,255,1)"
      temp_print("moving")
    } else if(this.state['attack']){
      c.fillStyle = "rgb(196, 92, 92)"
      temp_draw()
      c.fillStyle = "rgba(255,255,255,1)"
      temp_print("attack")
    }else {
      c.fillStyle = "rgba(255,0,255,1)"
      temp_draw()
      c.fillStyle = "rgba(255,255,255,1)"
      temp_print("idle")
    }

    if (this.counter) {
      temp_draw_gauge(this.counter)
      this.renderer.draw()
    }
  }
}

// only render
class MovieRenderer {
  constructor(master) {
    console.log("movie renderer online")
    this.master = master
    this.drawposition = { x: 0, y: 0 }
    this.MovieClips = {}
    this.length = 1 // numbers of frames
    this.currentFrame = 0
    this.cropbox = {}
    this.sprite = {
      width: 0,
      height: 0
    }
  }

  #update() {
    let mc = this.master.counter
    let mp = this.master.position
    this.drawposition.x = ((mp.x - 1) * canvas.width) / 6 + 10
    this.drawposition.y = (mp.y * canvas.height) / 6 + 40

    if (this.master.state['usingChip']) {
      this.length = 8
      this.sprite = { width: 56, height: 56 }

    } else if (this.master.state['moving']) {
      this.length = 8
      this.sprite = { width: 40, height: 64 }

    }else if (this.master.state['attack']) {
      this.length = 4
      this.sprite = { width: 44, height: 56 }

    }

    let FrameBuffer = mc.end_time / this.length
    this.currentFrame = Math.floor(mc.time / FrameBuffer)
    this.currentFrame %= this.length // loop
  }

  // draw position + Current Frame
  draw() {
    this.#update()

    const cropbox = {
      position: {
        x: this.sprite.width * this.currentFrame,
        y: 0,
      },
      width: this.sprite.width,
      height: this.sprite.height,
    }

    if (this.master.state["usingChip"]) {
      if (!imgLoaded) return
      c.drawImage(
        img,
        cropbox.position.x,
        cropbox.position.y,
        cropbox.width,
        cropbox.height,

        this.drawposition.x,
        this.drawposition.y,
        56,
        56,
      )
    } else if (this.master.state['moving']) {
      if (!img2Loaded) return
      c.drawImage(
        img2,
        cropbox.position.x,
        cropbox.position.y,
        cropbox.width,
        cropbox.height,

        this.drawposition.x,
        this.drawposition.y,
        40,
        64,
      )
    }else if(this.master.state['attack']){
      if(!img3Loaded) return
      c.drawImage(
        img3,
        cropbox.position.x,
        cropbox.position.y,
        cropbox.width,
        cropbox.height,

        this.drawposition.x,
        this.drawposition.y,
        44,
        56,
      )
    }

    c.fillStyle = 'rgba(0,0,0,1)'
    c.fillText(this.currentFrame, this.drawposition.x, this.drawposition.y + 20, 24)
  }
}

class GameManager {
  constructor() {
    console.log("game manager online")
    this.isPaused = false
    this.chips = []
    this.counters = []
    this.dominantCounter = null
    this.state = {
      pause: false,
      title: false,
      world: false,
      dialog: false,
      battle: true,
      battle_win: false,
    }
  }

  useChip() { }

  _showCounters() {
    let _table = "counters: "
    for (let _c of this.counters) {
      _table += _c.msg + ":" + _c.time + "/" + _c.end_time + "\n"
    }
    c.fillStyle = "rgba(0,0,0,1)"
    c.fillText(_table, 10, 30)
  }

  showChips() {
    let _table = "chip list:" + "\n"
    for (let chip of chip_selected) {
      _table += "\n" + chip.name
    }
    c.fillStyle = "rgba(0,0,0,1)"
    c.fillText(_table, 10, 50)
  }

  _draw_Darken() {
    c.fillStyle = "rgba(0,0,0,0.5)"
    c.fillRect(0, 0, canvas.width, canvas.height)
  }

  _handleInput() {
    if (this.state["title"]) {
      if (keys.select.pressed) {
        this.state["title"] = false
      }
      return
    } else if (this.state["dialog"]) {
      if (keys.select.pressed) {
        this.state["dialog"] = false
      }
    } else {
      if (keys.select.pressed) {
        if (this.state["pause"]) this.state["pause"] = false
        else this.state["pause"] = true
      }

      if (keys.add_sword.pressed) {
        if (this.state["pause"]) chip_selected.push(chip_list.sword)
      }

      if (keys.test.pressed) {
        this.addSPCounter()
      }
    }
  }

  addSPCounter() {
    let _c = new Counter({
      _endtime: 100,
    })

    _c.processCall = () => {
      let _t = _c.time
      if (_c.time == 1) PP.state["darken"] = true
      if (_c.time == 10) if (_c.time == 40) log("player animation")
      if (_c.time == 100) {
        log("over")
        PP.state["darken"] = false
      }

      if (_t < 10) {
        PP.fillStyle = `rgba(255,255,255,${Math.min(_t * 0.1, 1) * 0.5})`
      } else if (_t < 90) {
        PP.fillStyle = "rgba(255,255,255,0.5)"
      } else {
        PP.fillStyle = `rgba(255,255,255,${0.5 - (_t - 90) * 0.1 * 0.5})`
      }
    }
    GM.dominantCounter = _c
  }

  _addCounterGen({
    _endtime = 10,
    _msg = "_untitled_counter",
    _processCall = null,
    _endCall = () => {
      this.end = true
    },
    _gen_list = null,
    _qteCall = null,
  } = {}) {
    console.log("add time" + _msg)
    let _temp = new Counter({
      endtime: _endtime,
      msg: _msg,
      processCall: _processCall,
      endCall: _endCall,
      gen_list: _gen_list,
      qteCall: _qteCall,
    })
    this.counters.push(_temp)
    return _temp
  }

  #print_state() {
    c.fillStyle = "rgba(255,255,255,1)"
    c.fillText("pause and select", 10, 10)
  }

  #draw() {
    if (this.state["title"]) {
      c.fillStyle = "rgba(0,0,0,1)"
      c.fillRect(0, 0, canvas.width, canvas.height)
      c.fillStyle = "rgba(255,255,255,1)"
      c.fillText("press select key to start", 10, canvas.height / 2)
      return
    }

    if (this.state['battle_win']) {
      c.fillStyle = "rgba(255,255,255,1)"
      c.fillRect(0, 0, canvas.width, canvas.height)
      c.fillStyle = "rgba(0,20,0,1)"
      c.fillText("you win!", 10, canvas.height / 2)
      return
    }
    c.fillStyle = "rgba(200,230,250,1)"
    c.fillRect(0, 0, canvas.width, canvas.height)

    c.fillStyle = "rgba(200,200,200,1)"
    c.fillRect(0, canvas.height / 2, canvas.width, canvas.height)

    c.strokeStyle = "blue"
    c.lineWidth = 5
    c.beginPath() // パスの開始
    c.moveTo(0, canvas.height / 2) // 開始点（x:50, y:50）
    c.lineTo(0, canvas.height)
    c.lineTo(canvas.width, canvas.height) // 終点（x:250, y:100）
    c.lineTo(canvas.width, canvas.height / 2)
    c.lineTo(0, canvas.height / 2)
    for (let i = 1; i < 3; i++) {
      c.moveTo(0, (canvas.height / 6) * i + canvas.height / 2)
      c.lineTo(canvas.width, (canvas.height / 6) * i + canvas.height / 2)
    }
    for (let i = 1; i < 6; i++) {
      c.moveTo((canvas.width / 6) * i, canvas.height / 2)
      c.lineTo((canvas.width / 6) * i, canvas.height)
    }
    c.stroke()

    if (this.state["pause"]) {
      this._draw_Darken()
      this.#print_state()
    } else {
    }
    this._showCounters()
    this.showChips()
    this.#print_state()

    if (this.state["dialog"]) {
      if (imgLoaded) {
        c.drawImage(img, 0, 0, 30, 30)
      }
      c.fillStyle = "rgba(100,100,100,1)"
      c.fillRect(
        10,
        (canvas.height / 4) * 3,
        canvas.width - 20,
        canvas.height / 5,
      )
    }
    PP.draw()

    player.draw()
    enemy.draw()
  }
  #update_counters() {
    if (this.dominantCounter) {
      this.dominantCounter.update()
      if (this.dominantCounter.end) this.dominantCounter = null
      return
    }
    for (let _c of this.counters) {
      _c.update()
    }
    this.counters = this.counters.filter((_c) => _c.end == false)
  }

  update() {
    this._handleInput()

    if (this.state["title"]) {
    } else if (this.state["pause"]) {
      //     console.log('paused')
    } else {
      this.#update_counters()
      player.update()
      enemy.update()
      if (this.state['battle']) {
        if (enemy.HP <= 0) { this.state['battle_win'] = true; this.state['battle'] = false }
      }
      if (this.state['battle_win']) { console.log('win!') }

    }

    for (let _key in keys) keys[_key].pressed = false

    //console.log(message+counter)
    this.#draw()
  }
}

class PostProcessor {
  constructor() {
    this.state = {
      darken: false,
    }
    this.fillStyle = "rgba(0, 0, 0,1)"
  }
  draw() {
    if (this.state["darken"]) {
      //log(this.fillStyle)
      c.fillStyle = this.fillStyle
      c.fillRect(0, 0, canvas.width, canvas.height)

      this.down_saturation()
      c.fillStyle = "rgb(255, 255, 255)"
      c.fillText("auto proccessing...", canvas.width / 2, canvas.height / 2)
      c.save()
      let fontSize = 64
      c.font = `${fontSize}px Arial`
      c.fillStyle = "rgb(255, 211, 17)"
      c.fillText("WIPEOUT!", 0, canvas.height / 2)
      c.restore()
    }
  }

  down_saturation() {
    // 彩度を0%にして再描画
    const offCanvas = document.createElement("canvas")
    offCanvas.width = canvas.width
    offCanvas.height = canvas.height
    const offCtx = offCanvas.getContext("2d")

    // 一旦現在の canvas をオフスクリーンにコピー
    offCtx.drawImage(canvas, 0, 0)

    // 彩度を下げて再描画
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.filter = "saturate(20%)"
    c.drawImage(offCanvas, 0, 0)
    c.filter = "none" // 忘れずに戻す
  }
}

class Counter {
  constructor({
    endtime = 100,
    name = "",
    end = false,
    target = undefined,
    msg = "__",
    processCall = null,
    endCall = () => { },
    gen_list = false,
    qte = false,
    qteCall = false,
  } = {}) {
    this.time = 0
    this.end_time = endtime
    this.end = end
    this.target = target
    this.processCall = processCall
    this.msg = msg
    this.endCall = endCall
    this.gen_list = gen_list
    this.qteCall = qteCall
  }
  start() { }

  _isEnd() {
    return this.end
  }

  #endMethod() {
    console.log(this.msg + " " + this.end_time + " counter end")
    this.end = true
    this.endCall()
  }

  progress() {
    return this.time / this.end_time
  }

  update() {
    if (!this.end_time) {
      log('infinite Counter!')
      this.time++
      if (this.processCall) { this.processCall() }
      return
    }
    if (this.time < this.end_time) {
      this.time++
      if (this.processCall) { this.processCall() }
      if (this.gen_list) {
        let _length = Object.keys(this.gen_list).length
        for (let i = 0; i < _length; i++) {
          const _time = this.gen_list[i].time
          const _call = this.gen_list[i].call
          if (this.time == _time) {
            log("time: " + _time)
            _call()
          }
        }
      }
      if (this.qteCall) {
        if (keys.use_chip.pressed) {
          this.end = true
          this.qteCall()
        }
      }
    } else this.#endMethod()
  }
}

////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
//
//      utility_setup.js
//
////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

// maybe put these things into a class
const chip_list = {
  sword: { name: "sword" },
  wide_sword: { name: "wide_sword" },
  long_sword: { name: "long_sword" },
}

var chip_selected = []

for (let _c of chip_selected) {
  log(_c.name)
}

//////////////////////////////
//////////////////////////////
//                          //
//      main.js
//                          //
//////////////////////////////
//////////////////////////////

const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d", { willReadFrequently: true })
canvas.width = 300
canvas.height = 200
const tileSize = 50

let counter = 0
let player = new Player()
let enemy = new Player()
enemy.ID = CharID.Enemy
enemy.position = { x: 5, y: 2 }
const PP = new PostProcessor()
const GM = new GameManager()

// for html


let img = new Image()
let imgLoaded = false
img.src =
  "https://raw.githubusercontent.com/kurokoTJF/FUKAN/refs/heads/main/Sprites/red/enchant.png"
img.onload = () => {
  imgLoaded = true
}

let img2 = new Image()
let img2Loaded = false
img2.src =
  'https://raw.githubusercontent.com/kurokoTJF/FUKAN/refs/heads/main/Sprites/Char/IMG_4861.png'
img2.onload = () => {
  img2Loaded = true
}

let img3 = new Image()
let img3Loaded = false
img3.src =
  'https://raw.githubusercontent.com/kurokoTJF/FUKAN/refs/heads/main/Sprites/Char/IMG_4863.png'
img3.onload = () => {
  img3Loaded = true
}

function update() {
  //console.log(keys.down.pressed);
  GM.update()
  requestAnimationFrame(update)
}

update()