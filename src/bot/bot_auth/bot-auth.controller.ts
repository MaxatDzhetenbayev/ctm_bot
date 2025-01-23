import { Context } from "vm";
import { Update } from "nestjs-telegraf";

export interface RegistrationContext extends Context {
  session: {
    registrationStep?: string;
    full_name?: string;
    iin?: string;
    phone?: string;
    language: string;
  };
}

@Update()
export class BotAuthController {
  constructor() {}
}
