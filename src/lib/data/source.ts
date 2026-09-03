export type DataSource = "json" | "database";

const getDataSource = (): DataSource => {
  const source = process.env.NEXT_PUBLIC_DATA_SOURCE;
  if (source === "database") {
    return "database";
  }
  // Default to "json" for safe fallback and development
  return "json";
};

export const DATA_SOURCE: DataSource = getDataSource();
