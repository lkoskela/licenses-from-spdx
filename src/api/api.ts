import * as path from "path";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { Exception, Exceptions, License, Licenses } from "../types";
import { readFileAsString, fileIsOlderThan, fileIsValidJson } from "../utils/file-utils";
import { convertSpdxLicenseExceptionXmlToJsonObject, convertSpdxLicenseXmlToJsonObject } from "../rdf/rdf";
import { getStringAttribute } from "../rdf/extractors";
import { parseDownloadedXML, Namespaces } from "../xml/xml";
import { downloadRawContentFrom } from "../utils/download";
import { hash } from "../utils/hash";

export { Exception, License, Exceptions, Licenses };

export type GeneratedLicenseData = {
    licenses: Licenses;
    exceptions: Exceptions;
};

const SPDX_LICENSES_RDF_URL =
    "https://raw.githubusercontent.com/spdx/license-list-data/refs/heads/main/rdfxml/licenses.rdf";

function calculateVersionHash(...data: any[]): string {
    const str = data.reduce((acc, x) => acc + "#" + JSON.stringify(x));
    return hash(str).slice(0, 8);
}

function licenseDetailsObjectMapper(options: GenerateLicenseDataOptions, source: string) {
    return (entry: any) => {
        if (entry && entry.licenseId) {
            return {
                name: entry.name,
                licenseId: entry.licenseId,
                licenseText: options.excludeText ? undefined : entry.licenseText,
                licenseComments: options.excludeComments ? undefined : entry.licenseComments,
                isDeprecated: !!entry.isDeprecatedLicenseId,
                seeAlso: entry.seeAlso || [],
                source: source,
            };
        }
        return undefined;
    };
}

function exceptionDetailsObjectMapper(options: GenerateLicenseDataOptions, source: string) {
    return (entry: any) => {
        return {
            name: entry.name,
            licenseExceptionId: entry.licenseExceptionId,
            licenseExceptionText: options.excludeText ? undefined : entry.licenseExceptionText,
            licenseExceptionTemplate: options.excludeTemplates ? undefined : entry.licenseExceptionTemplate,
            licenseComments: options.excludeComments ? undefined : entry.licenseComments,
            isDeprecated: !!entry.isDeprecatedLicenseId,
            source: source,
        };
    };
}

function needsUpdate(filePath: string, oldestAcceptableTimestamp: Date): boolean {
    return !existsSync(filePath) || fileIsOlderThan(oldestAcceptableTimestamp, filePath) || !fileIsValidJson(filePath);
}

async function update(licenseFilePath: string, exceptionsFilePath: string, options: GenerateLicenseDataOptions) {
    const rawXml = await downloadRawContentFrom(SPDX_LICENSES_RDF_URL);
    if (options.verbose) {
        console.log(`Downloaded SPDX licenses RDF from ${SPDX_LICENSES_RDF_URL}`);
    }

    const { root, namespaces } = await parseDownloadedXML(rawXml, SPDX_LICENSES_RDF_URL, false);
    const nsSpdx = namespaces.byUri("http://spdx.org/rdf/terms#");

    const licenses = root[`${nsSpdx}:ListedLicense`]
        .map((x: any) => parseListedLicense(x, namespaces))
        .map(licenseDetailsObjectMapper(options, SPDX_LICENSES_RDF_URL))
        .sort((a: License, b: License) => a.licenseId.localeCompare(b.licenseId));

    const exceptions = root[`${nsSpdx}:ListedLicenseException`]
        .map((x: any) => parseListedLicenseException(x, namespaces))
        .map(exceptionDetailsObjectMapper(options, SPDX_LICENSES_RDF_URL))
        .sort((a: Exception, b: Exception) => a.licenseExceptionId.localeCompare(b.licenseExceptionId));

    const version = calculateVersionHash(licenses, exceptions);
    const releaseDate = new Date().toISOString();

    writeJsonFile(licenseFilePath, { licenses, version, releaseDate });
    writeJsonFile(exceptionsFilePath, { exceptions, version, releaseDate });
}

function writeJsonFile(filePath: string, content: object) {
    const serializedExceptions = JSON.stringify(content, null, 2).replace(/[^\x00-\x7F]/g, ""); // Throw unwanted characters away
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, serializedExceptions, { encoding: "utf8" });
}

function parseListedLicense(license: any, namespaces: Namespaces) {
    const nsRdf = namespaces.byUri("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    const about = getStringAttribute(license, `${nsRdf}:about`);
    const id = about?.split("/").pop();
    if (!id) {
        throw new Error(`Could not extract licenseId from ${JSON.stringify(about)}`);
    }
    return convertSpdxLicenseXmlToJsonObject(id, license, namespaces);
}

function parseListedLicenseException(exception: any, namespaces: Namespaces) {
    const nsRdf = namespaces.byUri("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    const about = getStringAttribute(exception, `${nsRdf}:about`);
    const id = about?.split("/").pop();
    if (!id) {
        throw new Error(`Could not extract licenseId from ${JSON.stringify(about)}`);
    }
    return convertSpdxLicenseExceptionXmlToJsonObject(id, exception, namespaces);
}

function dateHoursBeforeNow(hours: number): Date {
    const d = new Date();
    const nowInMillis = d.getTime();
    return new Date(nowInMillis - hours * 60 * 60 * 1000);
}

async function main(licenseFile: string, exceptionsFile: string, options: ResolvedOptions) {
    const threshold = dateHoursBeforeNow(options.updateFrequency);
    if (needsUpdate(licenseFile, threshold) || needsUpdate(exceptionsFile, threshold)) {
        await update(licenseFile, exceptionsFile, options);
        if (options.verbose) {
            console.log(`Updated license file ${licenseFile} and exceptions file ${exceptionsFile}`);
        }
    }
}

export type GenerateLicenseDataOptions = {
    /**
     * Whether to exclude the license text from the generated license data. Defaults to `false`.
     */
    excludeText?: boolean;

    /**
     * Whether to exclude the HTML version of license texts from the generated license data. Defaults to `true`.
     */
    excludeHtml?: boolean;

    /**
     * Whether to exclude template texts from the generated license data. Defaults to `true`.
     */
    excludeTemplates?: boolean;

    /**
     * Whether to exclude comments from the generated license data. Defaults to `false`.
     */
    excludeComments?: boolean;

    /**
     * Whether to print verbose output. Defaults to `false`.
     */
    verbose?: boolean;

    /**
     * Update frequency in hours. Defaults to `24`.
     */
    updateFrequency?: number;
};

type ResolvedOptions = GenerateLicenseDataOptions & {
    updateFrequency: number;
};

const defaultOptions: ResolvedOptions = {
    excludeComments: false,
    excludeText: false,
    excludeHtml: false,
    excludeTemplates: false,
    verbose: false,
    updateFrequency: 24,
};

/**
 * Create or update the license data files and return the generated license data.
 *
 * @param pathToLicensesFile `string` path to the licenses file (where it should be written if it doesn't exist yet)
 * @param pathToExceptionsFile `string` path to the exceptions file (where it should be written if it doesn't exist yet)
 * @param excludeText `boolean` whether to exclude the license text from the generated license data (default: false)
 * @returns `Promise` of the generated license data.
 */
export async function generateLicenseData(
    pathToLicensesFile: string,
    pathToExceptionsFile: string,
    options: GenerateLicenseDataOptions = {}
): Promise<GeneratedLicenseData> {
    await main(pathToLicensesFile, pathToExceptionsFile, { ...defaultOptions, ...options });
    return {
        licenses: JSON.parse(readFileAsString(pathToLicensesFile)),
        exceptions: JSON.parse(readFileAsString(pathToExceptionsFile)),
    };
}
