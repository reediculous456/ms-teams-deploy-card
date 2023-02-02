import { CardSection } from '.';

export class WebhookBody {
  public summary = `Github Actions ${process.env.GITHUB_WORKFLOW}`;
  public text?: string;
  public themeColor = `FFF49C`;
  public sections: CardSection[] = [];
}
