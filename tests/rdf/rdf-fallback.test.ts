import { downloadAndParseXML, resolveRdfFallbackForUrl } from "../../src/api/api";
import { convertSpdxXmlToJsonObject } from "../../src/rdf/rdf";

describe("RDF fallback", () => {
    describe("Fallback URL for a JSON document", () => {
        it("resolves correctly", () => {
            expect(resolveRdfFallbackForUrl("https://spdx.org/licenses/polyparse-exception.json")).toMatchObject({
                url: "https://raw.githubusercontent.com/spdx/license-list-data/main/rdfxml/polyparse-exception.rdf",
                licenseId: "polyparse-exception",
            });
        });
    });

    describe("Fallback XML/RDF document", () => {
        it("parses correctly", async () => {
            const xmlDoc = await downloadAndParseXML(
                "https://raw.githubusercontent.com/spdx/license-list-data/main/rdfxml/polyparse-exception.rdf",
                false
            );
            const converted = convertSpdxXmlToJsonObject(xmlDoc, "polyparse-exception");
            expect(converted).toMatchObject({
                licenseExceptionId: "polyparse-exception",
                name: "Polyparse Exception",
                isDeprecatedLicenseId: false,
            });
        });
    });
});
