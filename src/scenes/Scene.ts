export default abstract class Scene {
  public abstract processInput(deltaTime: number): void;
  public abstract update(deltaTime: number): Scene;
  public abstract render(): void;
}
