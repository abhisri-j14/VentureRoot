import { getTestRecord } from "@/repositories/test.repository";

export async function getTestData() {
  const record = await getTestRecord();

  return {
    status: "UP",
    service: "test",
    record,
  };
}