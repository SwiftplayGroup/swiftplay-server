const isBSONError = (error: unknown) => error instanceof Error && error.name.slice(0, 9) === "BSONError";

export default isBSONError;