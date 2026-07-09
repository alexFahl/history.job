import ct from "countries-and-timezones";

/**
 * getCountryList
 * Returns all countries sorted alphabetically for a dropdown selector
 *
 * @returns {Array<{ name: string, id: string }>}   - list of countries
 */
export const getCountryList = () => {
  const countries = ct.getAllCountries();

  return Object.values(countries)
    .map((c) => ({ name: c.name, id: c.id }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * getTimezoneForCountry
 * Returns the primary (first) timezone for a given country ID
 *
 * @param {string} countryId - ISO 3166-1 alpha-2 code (ex : "FR", "NZ", "AU"...)
 * @returns {string|null}    - IANA timezone string (ex: "Europe/Paris", or null)
 */
export const getTimezoneForCountry = (countryId) => {
  const country = ct.getCountry(countryId);
  if (!country || !country.timezones || country.timezones.length === 0)
    return null;
  return country.timezones[0]; // Primary timezone
};

/**
 * getCurrentTimeInTimezone
 * Returns the current local time string for a given IANA timezone
 *
 * @param {string} timezone - IANA timezone string (ex: "Pacific/Auckland")
 * @returns {string}        - current local time string (ex: "11:42:05 PM")
 */
export const getCurrentTimeInTimezone = (timezone) => {
  if (!timezone) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: timezone,
    hour12: false,
  }).format(new Date());
};
