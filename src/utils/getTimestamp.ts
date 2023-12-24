export const getTimestamp = (): string => {
  let today = new Date();
  let timestamp = today.getFullYear().toString();
  let month = today.getMonth() + 1
  let date = today.getDate()
  timestamp += `-${((month < 10) ? '0' : '') + month.toString()}`;
  timestamp += `-${((date < 10) ? '0' : '') + date.toString()}`;
  return timestamp
}