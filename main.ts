import * as P from 'pixi.js'
import { Engine } from 'matter-js'

import Game from './lib/game'

window.addEventListener('DOMContentLoaded', initGame)

function removeExistingGame(): void {
  const els = document.body.children
  if (els.length > 0) document.body.removeChild(els.item(0) as Node)
}

Game.CanvasWidth = 2000
Game.CanvasHeight = 2000 
Game.ViewportWidth = 640
Game.ViewportHeight = 480

function init(): P.Application {
  removeExistingGame()
  const app = new P.Application(
    Game.ViewportWidth,
    Game.ViewportHeight,
    { backgroundColor: 0x222222 }
  )
  document.body.appendChild(app.view)
  return app
}

function initGame(): void {
  const app = init()
  const engine = Engine.create()

  const game = new Game(app, engine)
  game.start()
  game.debugRender()
}

// @ts-ignore
if (module.hot) {
  // @ts-ignore
  module.hot.accept(function accept() {
    initGame()
  })
}
