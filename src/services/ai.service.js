import {
  loadAiContext,
} from "@/services/ai-context.service";

import {
  chatWithAi,
  analyzeBusinessWithAi,
  recommendBusinessWithAi,
} from "@/integrations/ai.client";

import {
  ServiceUnavailableError,
} from "@/errors/http-error";


export async function advisorChat({
  user,
  data,
}) {
  const trustedContext =
    await loadAiContext({
      userId: user.id,
      businessId:
        data.businessId ?? null,
    });


  /*
    Frontend context is untrusted supplemental context.

    It must NOT override backend-owned
    profile/business data.
  */
  const aiContext = {
    trusted:
      trustedContext,

    userProvided:
      data.context ?? null,
  };


  try {
    const result =
      await chatWithAi({
        message:
          data.message,

        context:
          aiContext,
      });

    return result;
  } catch (error) {
    throw new ServiceUnavailableError(
      "AI advisor is not available yet"
    );
  }
}


export async function analyzeBusiness({
  user,
  data,
}) {
  const trustedContext =
    await loadAiContext({
      userId: user.id,
      businessId:
        data.businessId,
    });


  try {
    const result =
      await analyzeBusinessWithAi({
        context: {
          trusted:
            trustedContext,
        },
      });

    return result;
  } catch (error) {
    throw new ServiceUnavailableError(
      "AI business analysis is not available yet"
    );
  }
}


export async function recommendBusiness({
  user,
  data,
}) {
  const trustedContext =
    await loadAiContext({
      userId: user.id,
      businessId:
        data.businessId,
    });


  try {
    const result =
      await recommendBusinessWithAi({
        context: {
          trusted:
            trustedContext,
        },
      });

    return result;
  } catch (error) {
    throw new ServiceUnavailableError(
      "AI business recommendation is not available yet"
    );
  }
}