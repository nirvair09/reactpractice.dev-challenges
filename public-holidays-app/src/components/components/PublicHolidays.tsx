import { useQuery } from "@tanstack/react-query";
import { getCountries, getPublicHolidays } from "../../api";
import { useState } from "react";

const PublicHolidays = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>("NL");
  const { data: countries, isLoading: areCountriesLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
  const { data: publicHolidays } = useQuery({
    queryKey: ["holidays", selectedCountry],
    queryFn: () => getPublicHolidays(selectedCountry),
  });
  return (
    <div className="container paper margin-top-large">
      <h1>Public Holidays</h1>
      <select
        value={selectedCountry}
        onChange={(e) => setSelectedCountry(e.target.value)}
      >
        {countries?.map((country) => (
          <option key={country.isoCode} value={country.isoCode}>
            {country.name[0].text}
          </option>
        ))}
        {areCountriesLoading && <option>Loading...</option>}
      </select>
      <ul>
        {publicHolidays?.map((holiday) => (
          <li key={holiday.id}>
            {new Date(holiday.startDate).toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
            })}{" "}
            - {holiday.name?.[0].text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PublicHolidays;