import {
  advisorChat,
  analyzeBusiness,
  recommendBusiness,
} from "@/services/ai.service";


export async function advisorChatController(
  user,
  validatedData
) {
  const response =
    await advisorChat({
      user,
      data:
        validatedData,
    });

  return {
    message:
      "AI advisor response generated successfully",

    data: {
      response,
    },
  };
}


export async function analyzeBusinessController(
  user,
  validatedData
) {
  const analysis =
    await analyzeBusiness({
      user,
      data:
        validatedData,
    });

  return {
    message:
      "Business analysis generated successfully",

    data: {
      analysis,
    },
  };
}


export async function recommendBusinessController(
  user,
  validatedData
) {
  const recommendation =
    await recommendBusiness({
      user,
      data:
        validatedData,
    });

  return {
    message:
      "Business recommendation generated successfully",

    data: {
      recommendation,
    },
  };
}