export default abstract class Scene {
  public abstract processInput(): void;
  public abstract update(deltaTime: number): Scene;
  public abstract render(): void;
}
