

import { getTestData } from "@/services/test.service";

export async function getTest() {
  const data = await getTestData();

  return {
    message: "Test API is working",
    data,
  };
}