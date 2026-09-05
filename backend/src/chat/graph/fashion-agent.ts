import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatOpenAI } from '@langchain/openai';
import { Gender } from '@prisma/client';
import { ClothesRepository } from 'src/clothes/clothes.repository';
import { CatalogService } from 'src/catalog/catalog.service';
import {
  CapsuleAgentService,
  PreviousCapsuleProposal,
} from '../capsule-agent/capsule-agent.service';
import { createGetUserWardrobeTool } from '../tools/get-user-wardrobe.tool';
import { createShowWardrobeItemsTool } from '../tools/show-wardrobe-items.tool';
import { createSearchWildberriesTool } from '../tools/search-wildberries.tool';
import { createCreateCapsuleTool } from '../tools/create-capsule.tool';
import { FASHION_AGENT_SYSTEM_PROMPT } from './system-prompt';
import { CostAccumulator } from 'src/billing/cost-accumulator';

export function buildFashionAgent(deps: {
  chatModel: ChatOpenAI;
  clothesRepository: ClothesRepository;
  catalogService: CatalogService;
  capsuleAgentService: CapsuleAgentService;
  userId: string;
  excludeWildberriesIds: string[];
  previousCapsuleProposal: PreviousCapsuleProposal | null;
  forceCapsuleSpec: boolean;
  gender: Gender | null;
  costAccumulator: CostAccumulator;
}) {
  const tools = [
    createGetUserWardrobeTool(deps.clothesRepository, deps.userId),
    createShowWardrobeItemsTool(deps.clothesRepository, deps.userId),
    createSearchWildberriesTool(
      deps.catalogService,
      deps.excludeWildberriesIds,
      deps.gender,
    ),
    createCreateCapsuleTool(
      deps.capsuleAgentService,
      deps.excludeWildberriesIds,
      deps.previousCapsuleProposal,
      deps.forceCapsuleSpec,
      deps.gender,
      deps.costAccumulator,
    ),
  ];

  return createReactAgent({
    llm: deps.chatModel,
    tools,
    prompt: FASHION_AGENT_SYSTEM_PROMPT,
  });
}
