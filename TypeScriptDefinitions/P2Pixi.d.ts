// TypeScript definitions for p2Pixi v1.0.0

declare namespace P2Pixi {

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

    loadAssets(assetUrls: string[]): void;
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

    pauseToggle(): void;

    windowBlur(e: UIEvent): void;
    windowFocus(e: FocusEvent): void;

  }

  export interface GameOptions {

    pixiAdapter?: PixiAdapter;
    pixiAdapterOptions?: PixiAdapterOptions;
    trackedBodyOffset?: number[];
    worldOptions?: any;
    assetUrls?: string[];

  }

  export class GameObject {

    constructor(game: Game);

    game: Game;
    bodies: p2.Body[];
    containers: PIXI.Container[];
    children: GameObject[];

    addBody(body: p2.Body): GameObject;
    removeBody(body: p2.Body): GameObject;

    addShape(body: p2.Body, shape: p2.Shape, options: AddShapeOptions): GameObject;

    addConstraint(constraint: p2.Constraint): GameObject;
    removeConstraint(constraint: p2.Constraint): GameObject;

    addChild(child: GameObject): void;

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
    drawPlane(graphics: PIXI.Graphics, x0: number, x1: number, styleOptions: StyleOptions): void;
    drawLine(graphics: PIXI.Graphics, len: number, styleOptions: StyleOptions): void;
    drawCapsule(graphics: PIXI.Graphics, x: number, y: number, angle: number, len: number, radius: number, styleOptions: StyleOptions): void;
    drawBox(graphics: PIXI.Graphics, x: number, y: number, width: number, height: number, styleOptions: StyleOptions): void;
    drawConvex(graphics: PIXI.Graphics, verts: number[][], styleOptions: StyleOptions): void;
    drawPath(graphics: PIXI.Graphics, path: number[][], styleOptions: StyleOptions): void;

    addShape(container: PIXI.Container, shape: p2.Shape, options?: ShapeOptions): void;

    resize(width: number, height: number): void; 

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

    lineWidthUnits?: number;
    lineWidth?: number;
    lineColor?: number;
    fillColor?: number;

  }

  export interface ShapeOptions {

    offset?: p2.vec2;
    angle?: number;
    textureOptions?: TextureOptions;
    styleOptions?: StyleOptions;
    alpha?: number;

  }
}

export = P2Pixi;