import * as P from 'pixi.js'
import { Engine } from 'matter-js'

import Game from './lib/game'

window.addEventListener('DOMContentLoaded', initGame)

function removeExistingGame() : void {
  const els = document.body.children
  if (els.length > 0) document.body.removeChild(els.item(0) as Node)
}

const CANVAS_WIDTH   = 640 
const CANVAS_HEIGHT  = 480 
Game.CanvasWidth = CANVAS_WIDTH
Game.CanvasHeight = CANVAS_HEIGHT

function init() : P.Application {
  removeExistingGame()
  const app = new P.Application(
      CANVAS_WIDTH
    , CANVAS_HEIGHT
    , { backgroundColor: 0x222222 }
  )
  document.body.appendChild(app.view)
  return app
}

function initGame() : void {
  const app = init()
  const engine = Engine.create()

  const game = new Game(app, engine)
  game.start()
  // game.debugRender()
}

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept(function accept() {
    initGame()
  })
}
