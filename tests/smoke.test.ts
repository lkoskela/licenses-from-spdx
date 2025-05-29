import { mkdtempSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { generateLicenseData, GeneratedLicenseData, License, Exception } from "../src/index";

describe("Smoke Test", () => {
    let licensesFilePath: string;
    let exceptionsFilePath: string;
    let generatedData: GeneratedLicenseData;

    beforeAll(async () => {
        const folder = mkdtempSync(join(tmpdir(), "foo-"));
        licensesFilePath = join(folder, "licenses.json");
        exceptionsFilePath = join(folder, "exceptions.json");
        console.log(
            `Generating license data for tests at ${licensesFilePath} and license exception data at ${exceptionsFilePath}`
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

        it("should contain Autoconf-exception-2.0", () => {
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
                source: "https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/rdfxml/licenses.rdf",
            });
        });

        it("should contain polyparse-exception", () => {
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
                source: "https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/rdfxml/licenses.rdf",
            });
        });

        it("should contain LZMA-SDK-9.22", () => {
            const licenses = JSON.parse(readFileSync(licensesFilePath).toString());
            const lzmaSdk = licenses.licenses.find((license: License) => license.licenseId === "LZMA-SDK-9.22");
            expect(lzmaSdk).toBeDefined();
            expect(lzmaSdk.licenseComments).toBeDefined();
            expect(lzmaSdk.licenseComments.trim().length).toBeGreaterThan(0);
            expect(lzmaSdk).toMatchObject({
                licenseId: "LZMA-SDK-9.22",
                name: "LZMA SDK License (versions 9.22 and beyond)",
                isDeprecated: false,
                seeAlso: [
                    "https://www.7-zip.org/sdk.html",
                    "https://sourceforge.net/projects/sevenzip/files/LZMA%20SDK/",
                ],
                source: "https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/rdfxml/licenses.rdf",
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
