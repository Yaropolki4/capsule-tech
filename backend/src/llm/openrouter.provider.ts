import { ConfigType } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { openrouterConfig } from 'src/config/env-config/load-config';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

export const OPENROUTER_CHAT_MODEL = Symbol('OPENROUTER_CHAT_MODEL');
export const OPENROUTER_VISION_MODEL = Symbol('OPENROUTER_VISION_MODEL');

export const openrouterChatModelProvider = {
  provide: OPENROUTER_CHAT_MODEL,
  useFactory: (config: ConfigType<typeof openrouterConfig>) => {
    return new ChatOpenAI({
      apiKey: config.apiKey,
      model: config.chatModel,
      configuration: { baseURL: OPENROUTER_BASE_URL },
    });
  },
  inject: [openrouterConfig.KEY],
};

export const openrouterVisionModelProvider = {
  provide: OPENROUTER_VISION_MODEL,
  useFactory: (config: ConfigType<typeof openrouterConfig>) => {
    return new ChatOpenAI({
      apiKey: config.apiKey,
      model: config.visionModel,
      configuration: { baseURL: OPENROUTER_BASE_URL },
    });
  },
  inject: [openrouterConfig.KEY],
};
