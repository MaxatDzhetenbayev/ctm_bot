import { Markup } from 'telegraf';

export class KeyboardHelper {
  static createInlineKeyboard(
    buttons: { text: string; callback_data: string }[][],
  ) {
    return Markup.inlineKeyboard(buttons);
  }

  static createProjectButtons(projects: { name: string; projectId: string }[]) {
    const buttons = projects.map((project) => [
      { text: project.name, callback_data: `project_${project.projectId}` },
    ]);
    return this.createInlineKeyboard(buttons);
  }
}
