import { mkdtempSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { generateLicenseData, GeneratedLicenseData, License, Exception } from "../src/index";
import { isDeepStrictEqual } from "util";

describe("Smoke Test", () => {
    let licensesFilePath: string;
    let exceptionsFilePath: string;
    let generatedData: GeneratedLicenseData;

    beforeAll(async () => {
        const folder = mkdtempSync(join(tmpdir(), "foo-"));
        licensesFilePath = join(folder, "licenses.json");
        exceptionsFilePath = join(folder, "exceptions.json");
        console.log(
            `Generating license data at ${licensesFilePath} and license exception data at ${exceptionsFilePath}`
        );
        generatedData = await generateLicenseData(licensesFilePath, exceptionsFilePath);
    }, 60000);

    describe("Generated files", () => {
        it("files should be generated", () => {
            expect(statSync(licensesFilePath).isFile()).toBe(true);
            expect(statSync(exceptionsFilePath).isFile()).toBe(true);
        });

        it("should contain 0BSD license", () => {
            const licenses = JSON.parse(readFileSync(licensesFilePath).toString());
            expect(Array.isArray(licenses.licenses)).toBe(true);
            const zeroBsd = licenses.licenses.find((license: License) => license.licenseId === "0BSD");
            expect(zeroBsd).toBeDefined();
        });

        it("should contain Autoconf-exception-2.0 (from JSON)", () => {
            const exceptions = JSON.parse(readFileSync(exceptionsFilePath).toString());
            expect(Array.isArray(exceptions.exceptions)).toBe(true);
            const autoconfException = exceptions.exceptions.find(
                (exception: Exception) => exception.licenseExceptionId === "Autoconf-exception-2.0"
            );
            expect(autoconfException).toBeDefined();
            expect(autoconfException).toMatchObject({
                name: "Autoconf exception 2.0",
                licenseExceptionId: "Autoconf-exception-2.0",
                isDeprecated: false,
                source: "https://spdx.org/licenses/Autoconf-exception-2.0.json",
            });
        });

        it("should contain polyparse-exception (from RDF fallback)", () => {
            const exceptions = JSON.parse(readFileSync(exceptionsFilePath).toString());
            expect(Array.isArray(exceptions.exceptions)).toBe(true);
            const polyparseException = exceptions.exceptions.find(
                (exception: Exception) => exception.licenseExceptionId === "polyparse-exception"
            );
            expect(polyparseException).toBeDefined();
            expect(polyparseException).toMatchObject({
                name: "Polyparse Exception",
                licenseExceptionId: "polyparse-exception",
                isDeprecated: false,
                source: "https://raw.githubusercontent.com/spdx/license-list-data/main/rdfxml/polyparse-exception.rdf",
            });
        });
    });

    describe("Returned data", () => {
        it("has an array of licenses", () => {
            expect(Array.isArray(generatedData.licenses.licenses)).toBe(true);
        });

        it("has an array of exceptions", () => {
            expect(Array.isArray(generatedData.exceptions.exceptions)).toBe(true);
        });

        it("licenses contain 0BSD", () => {
            const zeroBsd = generatedData.licenses.licenses.find((lic: License) => lic.licenseId === "0BSD");
            expect(zeroBsd).toBeDefined();
        });

        it("exceptions contain Autoconf-exception-2.0", () => {
            const exception = generatedData.exceptions.exceptions.find(
                (exc: Exception) => exc.licenseExceptionId === "Autoconf-exception-2.0"
            );
            expect(exception).toBeDefined();
        });
    });
});
