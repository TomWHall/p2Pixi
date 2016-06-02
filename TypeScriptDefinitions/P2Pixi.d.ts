// TypeScript definitions for p2Pixi v1.0.0

/// <reference path="./p2/index.d.ts"/>
/// <reference path="./pixi.js/pixi.js.d.ts"/>

declare module P2Pixi {

  export class Game {

    constructor(options: GameOptions);

    options: GameOptions;
    pixiAdapter: PixiAdapter;
    world: p2.World;
    gameObjects: GameObject[];
    trackedBody: p2.Body;
    paused: boolean;
    windowFocused: boolean;
    lastWorldStepTime: number;
    assetsLoaded: boolean;

    loadAssets(assetUrls: string[]);
    isReadyToRun(): boolean;
    runIfReady(): void;

    beforeRun(): void;
    run(): void;

    beforeRender(): void;
    render(): void;
    afterRender(): void;

    addGameObject(gameObject: GameObject): void;
    removeGameObject(gameObject: GameObject): void;
    clear(): void;

    time(): number;
    pauseToggle(): void;

    windowBlur(e: UIEvent): void;
    windowFocus(e: FocusEvent): void;

  }

  export interface GameOptions {

    pixiAdapter?: PixiAdapter;
    pixiAdapterOptions?: PixiAdapterOptions;
    trackedBodyOffset?: number[];
    worldOptions?: any;

  }

  export class GameObject {

    constructor(game: Game);

    game: Game;
    bodies: p2.Body[];
    containers: PIXI.Container[];

    addBody(body: p2.Body);
    addShape(body: p2.Body, shape: p2.Shape, options: AddShapeOptions);

    addConstraint(constraint: p2.Constraint);

    addChild(child: GameObject);

    updateTransforms(): void;

    remove(): void;

  }

  export interface AddShapeOptions extends ShapeOptions {

    collisionOptions?: CollisionOptions;

  }

  export interface CollisionOptions {

    collisionGroup: number;
    collisionMask: number;

  }

  export class PixiAdapter {

    constructor(options?: PixiAdapterOptions);

    options: PixiAdapterOptions;
    pixelsPerLengthUnit: number;
    stage: PIXI.Container;
    container: PIXI.Container;
    renderer: PIXI.SystemRenderer;

    viewCssWidth: number;
    viewCssHeight: number;
    windowWidth: number;
    windowHeight: number;

    setupRenderer(): void;
    setupView(): void;

    drawCircle(graphics: PIXI.Graphics, x: number, y: number, radius: number, styleOptions: StyleOptions): void;
    drawPlane(graphics: PIXI.Graphics, x0: number, x1: number, styleOptions: StyleOptions);
    drawLine(graphics: PIXI.Graphics, len: number, styleOptions: StyleOptions): void;
    drawCapsule(graphics: PIXI.Graphics, x: number, y: number, angle: number, len: number, radius: number, styleOptions: StyleOptions): void;
    drawBox(graphics: PIXI.Graphics, x: number, y: number, width: number, height: number, styleOptions: StyleOptions): void;
    drawConvex(graphics: PIXI.Graphics, verts: number[][], styleOptions: StyleOptions): void;
    drawPath(graphics: PIXI.Graphics, path: number[][], styleOptions: StyleOptions);

    addShape(container: PIXI.Container, shape: p2.Shape, options?: ShapeOptions);

  }

  export interface PixiAdapterOptions {

    width?: number;
    height?: number;
    pixelsPerLengthUnit?: number;
    useDeviceAspect?: boolean;
    rendererOptions?: PIXI.RendererOptions;

  }

  export interface TextureOptions {

    texture: PIXI.Texture;
    tile?: boolean;

  }

  export interface StyleOptions {

    lineWidth?: number;
    lineColor?: number;
    fillColor?: number;

  }

  export interface ShapeOptions {

    offset?: p2.vec2;
    angle?: number;
    textureOptions?: any;
    styleOptions?: StyleOptions;
    alpha?: number;

  }
}

declare module 'P2Pixi' {
  export = P2Pixi;
}