import cheerio from "cheerio";
import EarthquakeInterface from "~~/interfaces/earthquake.interface";
export default defineEventHandler(async (event) => {
  if (event.node.req.method === "GET") {
    const afadWeb = await $fetch<Promise<string>>(
      "https://deprem.afad.gov.tr/last-earthquakes.html"
    );
    const $ = cheerio.load(afadWeb);
    let data: Array<EarthquakeInterface> = [];
    const parse = (): void => {
      $("tbody")
        .find("tr")
        .map((i, el) => {
          const [
            CreatedDate,
            Latitude,
            Longitude,
            Depth,
            Type,
            Magnitude,
            Region,
            ID,
          ] = $(el).find("td");
          data.push({
            ID: $(ID).text(),
            Date: $(CreatedDate).text().replaceAll("-", "/"),
            Latitude: Number($(Latitude).text()),
            Longitude: Number($(Longitude).text()),
            Depth: Number($(Depth).text()),
            Magnitude: Number($(Magnitude).text()),
            Region: parseRegion($(Region).text()),
            Type: $(Type).text(),
          });
        });
    };
    parse();
    return data;
  }
});

const parseRegion = (region: string): EarthquakeInterface["Region"] => {
  let [district, city] = region?.split("("); // -> istanbul)
  city = city?.split(")")[0]; // -> istanbul
  if (!city) {
    city = district;
    district = "-";
  }
  return {
    City: city,
    District: district,
  };
};
