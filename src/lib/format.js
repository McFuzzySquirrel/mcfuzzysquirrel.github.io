export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Johannesburg",
    year: "numeric"
  }).format(date);
}
