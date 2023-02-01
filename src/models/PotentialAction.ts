export class PotentialAction {
  public "@context" = `http://schema.org`;
  public "@type" = `ViewAction`;
  public name = ``;
  public target: string[] = [];

  public constructor(name: string, target: string[]) {
    this.name = name;
    this.target = target;
  }
}
