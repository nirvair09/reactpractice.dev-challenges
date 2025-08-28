type CountriesResponsse = [
  {
    isoCode: string;
    name: [
      {
        language: string;
        text: string;
      }
    ];
    officialLanguages: string[];
  }
];

export const getCountries = async (): Promise<CountriesResponsse> => {
  const response = await fetch(
    "https://openholidaysapi.org/Countries?languageIsoCode=EN"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch countries");
  }
  return response.json();
};

type PublicHolidaysResponse = [
  {
    id: string;
    startDate: string;
    endDate: string;
    type: string;
    name: {
      language: string;
      text: string;
    }[];
    regionalScope: string;
    temporalScope: string;
    nationwide: boolean;
  }
];

export const getPublicHolidays = async (
  countryIsoCode: string
): Promise<PublicHolidaysResponse> => {
  const params = new URLSearchParams({
    countryIsoCode,
    validFrom: "2025-01-01",
    validTo: "2025-12-31",
  });

  const response = await fetch(
    `https://openholidaysapi.org/PublicHolidays?${params}`
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};