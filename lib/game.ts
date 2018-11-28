import * as P from 'pixi.js'
import Viewport from 'pixi-viewport'
import {
  Bodies,
  Body,
  Engine,
  Events,
  Render,
  World,
  IChamferableBodyDefinition
} from 'matter-js'

const DEBUG = true

interface IGraphicsOptions {
  color: number
  alpha?: number
  radius?: number
}

interface IGameObject {
  body: Body
  graphics: P.Graphics
  update(): void
}

abstract class GameObject implements IGameObject {
  _body: Body
  _graphics: P.Graphics

  constructor(body: Body, graphics = new P.Graphics()) {
    this._body = body
    this._graphics = graphics
  }
  get body(): Body { return this._body }
  get graphics(): P.Graphics { return this._graphics }


  _syncPosition() {
    const { x, y } = this._body.position
    this._graphics.position.set(x, y)
  }

  update() {
    this._syncPosition()
    this._graphics.rotation = this._body.angle
  }
}

class Box extends GameObject {
  _width: number
  _height: number

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    graphicsOptions: IGraphicsOptions,
    bodyOptions: IChamferableBodyDefinition = {}
  ) {
    super(Bodies.rectangle(x, y, width, height, bodyOptions))

    this._width = width
    this._height = height

    this._draw(graphicsOptions)
  }

  _draw(opts: IGraphicsOptions) {
    this._graphics.beginFill(opts.color, opts.alpha)
    this._graphics.drawRect(0, 0, this._width, this._height)
    this._graphics.endFill()
    if (DEBUG) this._drawDebug()
    this._graphics.pivot.set(this._width / 2, this._height / 2)
    this._syncPosition()
  }

  _drawDebug() {
    this._graphics.beginFill(0x000000, 0.2)
    this._graphics.drawCircle(this._width / 2, this._height / 2, 2)
    this._graphics.drawRect(this._width / 2, 0, 1, this._height / 2)
    this._graphics.endFill()
  }
}

class Circle extends GameObject {
  _radius: number

  constructor(
    x: number,
    y: number,
    radius: number,
    graphicsOptions: IGraphicsOptions,
    bodyOptions: IChamferableBodyDefinition = {}
  ) {
    super(Bodies.circle(x, y, radius, bodyOptions))
    this._radius = radius
    this._draw(graphicsOptions)
  }

  _draw(opts: IGraphicsOptions) {
    this._graphics.beginFill(opts.color, opts.alpha)
    this._graphics.drawCircle(0, 0, this._radius)
    this._graphics.endFill()
    if (DEBUG) this._drawDebug()
    this._syncPosition()
  }

  _drawDebug() {
    this._graphics.beginFill(0x000000, 0.2)
    this._graphics.drawCircle(0, 0, 2)
    this._graphics.drawRect(0, -this._radius, 2, this._radius)
    this._graphics.endFill()
  }
}

class Scene {
  _world: World;
  _container: P.Container;
  _gameObjects: Array<IGameObject> = []
  _liveObjects: Array<IGameObject> = []

  constructor(world: World, container: P.Container) {
    this._world = world
    this._container = container
  }

  addGameObject(gameObject: IGameObject) {
    World.addBody(this._world, gameObject.body)
    this._container.addChild(gameObject.graphics)
    this._gameObjects.push(gameObject)
    if (!gameObject.body.isStatic) this._liveObjects.push(gameObject)
  }

  add(gameObjects: Array<IGameObject>) {
    for (const gameObject of gameObjects) this.addGameObject(gameObject)
  }

  update() {
    for (const gameObject of this._liveObjects) {
      gameObject.update()
    }
  }
}

export default class Game {
  _app: P.Application
  _engine: Engine
  _world: World
  _scene: Scene
  _viewport: Viewport

  static CanvasWidth: number
  static CanvasHeight: number
  static ViewportWidth: number
  static ViewportHeight: number
  static FPS: number = 60

  constructor(app: P.Application, engine: Engine) {
    this._app = app
    this._engine = engine
    this._world = engine.world
    this._viewport = new Viewport({
      screenWidth: Game.ViewportWidth,
      screenHeight: Game.ViewportHeight,
      worldWidth: Game.CanvasWidth,
      worldHeight: Game.CanvasHeight
    })
    app.stage.addChild(this._viewport)
    this._scene = new Scene(engine.world, this._viewport)
    this._bind()

    this._buildWorld()
  }

  _bind() {
    this._update = this._update.bind(this)
  }

  _buildWorld() {
    const ground = new Box(
      Game.CanvasWidth / 2, Game.CanvasHeight - 100,
      Game.CanvasWidth, 10,
      { color: 0xaaaaaa },
      { isStatic: true }
    )
    const box1 = new Box(215, 0, 30, 20, { color: 0xff0000 })
    const box2 = new Box(255, 0, 30, 20, { color: 0x0000ff })
    const box3 = new Box(220, 200, 80, 80, { color: 0x00ff00 }, { angle: Math.PI / 6 })
    const box4 = new Box(300, 10, 100, 100, { color: 0xaaaaaa }, { angle: Math.PI / 16, isStatic: true  })
    const box5 = new Box(190, Game.CanvasHeight / 2, 100, 100, { color: 0xaaaaaa }, { angle: Math.PI / 16, isStatic: true  })
    const circle = new Circle(240, 10, 50, { color: 0x0000ff })

    this._viewport.follow(circle.graphics, { radius: 150 })
    this._scene.add([ground, box1, box2, box3, box4, box5, circle])
  }

  start() {
    Events.on(this._engine, 'afterUpdate', this._update)
    Engine.run(this._engine)
  }

  debugRender() {
    const render = Render.create({
      element: document.body,
      engine: this._engine,
      options: { width: Game.CanvasWidth, height: Game.CanvasHeight }
    })
    Render.run(render)
  }

  _update() {
    this._scene.update()
  }
}
