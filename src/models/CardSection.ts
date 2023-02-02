import { Fact, PotentialAction } from '.';

export class CardSection {
  public activityTitle = ``;
  public activitySubtitle?: string = ``;
  public activityImage = ``;
  public activityText?: string;
  public facts?: Fact[];
  public potentialAction?: PotentialAction[];
  public msteams?: { entities?: Array<{ type: string, text: string, mentioned?: { id: string, name: string } }> };
}
