export const timestampToNumber = (timestamp: string) => {
  return new Date(timestamp).getTime();
};
