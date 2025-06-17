export default abstract class Scene {
  public abstract processInput(deltaTime: number, canvas: HTMLCanvasElement, endIntro): void;
  public abstract update(deltaTime: number): Scene;
  public abstract render(): void;
}
