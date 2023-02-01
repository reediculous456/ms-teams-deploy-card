import { CardSection } from '.';

export class WebhookBody {
  public summary = `Github Actions CI`;
  public text?: string;
  public themeColor = `FFF49C`;
  public sections: CardSection[] = [];
}
