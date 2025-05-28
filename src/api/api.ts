import { createHash } from "crypto";
import { pipeline } from "stream";
import * as path from "path";
import { get } from "https";
import { readFileSync, writeFileSync, createWriteStream, existsSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { Exceptions, Licenses } from "../types";
import { readFileAsString, fileIsOlderThan, fileIsValidJson } from "../utils/file-utils";
import { convertSpdxXmlToJsonObject } from "../rdf/rdf";
import { parseXML } from "../xml/xml";

const LICENSE_FILE_URL = "https://raw.githubusercontent.com/spdx/license-list-data/master/json/licenses.json";
const EXCEPTIONS_FILE_URL = "https://raw.githubusercontent.com/spdx/license-list-data/master/json/exceptions.json";
const EXCEPTION_DETAILS_FILE_BASEURL =
    "https://raw.githubusercontent.com/spdx/license-list-data/master/json/exceptions/";
const DETAILS_DOWNLOAD_BATCH_SIZE = 10;

const hash = (str: string): string => {
    let shasum = createHash("sha1");
    shasum.update(str);
    return shasum.digest("hex");
};

export function resolveRdfFallbackForUrl(url: string): { url: string; licenseId: string } | undefined {
    let licenseId = url.match(/https:\/\/spdx.org\/licenses\/(.*?).json/)?.[1];
    if (licenseId) {
        return {
            url: `https://raw.githubusercontent.com/spdx/license-list-data/main/rdfxml/${licenseId}.rdf`,
            licenseId: licenseId,
        };
    }
    return undefined;
}

export async function attemptXmlRdfFallback(url: string): Promise<any> {
    const fallback = resolveRdfFallbackForUrl(url);
    if (fallback) {
        console.debug(`Found ${fallback.url} as fallback for ${url}`);
        try {
            let xmlDoc = await downloadAndParseXML(fallback.url, false);
            const obj = convertSpdxXmlToJsonObject(xmlDoc, fallback.licenseId);
            obj.source = fallback.url;
            return obj;
        } catch (err: any) {
            console.debug(`Could not find XML/RDF fallback for ${url} at ${fallback.url}: ${err}`, err.stack);
            return Promise.reject(`Could not find ${fallback.url} either as a fallback for ${url}`);
        }
    }
    return Promise.reject(`Don't know where to look for an XML/RDF fallback for ${url}`);
}

const downloadJSON = async (url: string): Promise<any> => {
    const rawJson = await downloadRawContentFrom(url);
    try {
        const obj = JSON.parse(rawJson);
        obj.source = url;
        return obj;
    } catch (err) {
        // Since the SPDX project's data is often messed up such that a given license's JSON file is missing
        // even though the equivalent XML source file exists, let's fall back to downloading and parsing the
        // XML file is it exists.
        return attemptXmlRdfFallback(url).catch(() => {
            const errorPayload = {
                error: `Error parsing JSON from ${url}: ${err}`,
                details: `Raw content received:\n${rawJson}`,
            };
            console.error(`${errorPayload.error}\n\n${errorPayload.details}`);
            return errorPayload;
        });
    }
};

const downloadRawContentFrom = async (url: string): Promise<any> => {
    const rawContent = await new Promise<string>((resolve, _reject) => {
        const tmpFilePath = path.join(tmpdir(), hash(url));
        get(url, { agent: false }, (response) => {
            const callback = (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    console.warn(`Could not download content from ${url} - ${err}`);
                    resolve("{}");
                } else {
                    resolve(readFileSync(tmpFilePath).toString());
                }
                response.destroy();
            };
            pipeline(response, createWriteStream(tmpFilePath), callback);
        });
    });
    return rawContent;
};

export async function downloadAndParseXML(url: string, preserveOrder: boolean = true): Promise<any> {
    const rawXml = await downloadRawContentFrom(url);
    try {
        return parseXML(rawXml, preserveOrder);
    } catch (err) {
        console.error(`Error parsing XML from ${url}: ${err}\n\nRaw content:\n${rawXml}`);
        return Promise.reject({
            error: `Error parsing XML from ${url}: ${err}`,
            details: `Raw content received:\n${rawXml}`,
        });
    }
}

function sliceIntoChunks<T>(arr: T[], chunkSize: number): T[][] {
    const res: T[][] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk: T[] = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

const downloadManyJSONFiles = async (arrayOfURLs: string[]): Promise<any[]> => {
    const batches = sliceIntoChunks(arrayOfURLs, DETAILS_DOWNLOAD_BATCH_SIZE);
    const results: any[] = [];
    for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const batchResults = await Promise.all(batch.map(downloadJSON));
        batchResults.forEach((result) => results.push(result));
    }
    return results;
};

const readLicenseListVersionFromJsonObject = (jsonObj: any): string => jsonObj.licenseListVersion;

const readLicensesFromFile = (file_path: string): any[] => {
    if (existsSync(file_path) && fileIsValidJson(file_path)) {
        const jsonObj = JSON.parse(readFileSync(file_path).toString());
        return jsonObj.licenses.filter((x: any) => !!x);
    }
    console.warn(`File ${file_path} does not exist - can't read licenses from it`);
    return [];
};

const readLicenseListVersionFromFile = (file_path: string): string => {
    if (existsSync(file_path) && fileIsValidJson(file_path)) {
        const jsonObj = JSON.parse(readFileSync(file_path).toString());
        return readLicenseListVersionFromJsonObject(jsonObj);
    }
    return "";
};

const updateFileFromURL = async (
    destinationFilePath: string,
    sourceUrl: string,
    entryListKey: string,
    detailsUrlMapper: (obj: any) => string,
    detailsObjectMapper: (obj: any) => any
) => {
    const json = await downloadJSON(sourceUrl);
    const latestVersion = readLicenseListVersionFromJsonObject(json);
    const localVersion = readLicenseListVersionFromFile(destinationFilePath);
    if (!!latestVersion && latestVersion === localVersion) {
        console.log(`${destinationFilePath} already has version ${latestVersion} from ${sourceUrl} --> skip update`);
    } else {
        console.log(`Update available (from ${localVersion} to ${latestVersion}) --> updating ${entryListKey}`);
        const urls = json[entryListKey].map(detailsUrlMapper) as string[];
        const details = await downloadManyJSONFiles(urls);
        json[entryListKey] = details.filter((x) => !!x && !x.error).map(detailsObjectMapper);
        const str = JSON.stringify(json, null, 2).replace(/[^\x00-\x7F]/g, ""); // Throw unwanted characters away
        mkdirSync(path.dirname(destinationFilePath), { recursive: true });
        writeFileSync(destinationFilePath, str, { encoding: "utf8" });
        console.log(`Updated ${destinationFilePath} with version ${latestVersion} from ${sourceUrl}`);
    }
};

const updateLicenseFileAt = async (destinationFilePath: string) => {
    const licenseDetailsUrlMapper = (license: any) => license.detailsUrl;
    const licenseDetailsObjectMapper = (license: any) => {
        if (license && license.licenseId) {
            return {
                name: license.name,
                licenseId: license.licenseId,
                licenseText: license.licenseText,
                isDeprecated: !!license.isDeprecatedLicenseId,
                seeAlso: license.seeAlso || [],
            };
        }
        return undefined;
    };
    try {
        await updateFileFromURL(
            destinationFilePath,
            LICENSE_FILE_URL,
            "licenses",
            licenseDetailsUrlMapper,
            licenseDetailsObjectMapper
        );
    } catch (err) {
        console.error(`Updating ${destinationFilePath} failed: ${err}`, err);
    }
};

const updateExceptionsFileAt = async (exceptionsFilePath: string, licensesFilePath: string) => {
    const exceptionDetailsUrlMapper = (entry: any) => {
        if (
            (entry.detailsUrl?.startsWith("https://") || entry.detailsUrl?.startsWith("http://")) &&
            entry.detailsUrl?.endsWith(".json")
        ) {
            return entry.detailsUrl;
        } else if (entry.licenseExceptionId) {
            return EXCEPTION_DETAILS_FILE_BASEURL + entry.licenseExceptionId + ".json";
        } else if (entry.reference?.startsWith("/")) {
            const base = EXCEPTION_DETAILS_FILE_BASEURL + entry.reference.replace(/^.\//, "");
            const suffix = base.endsWith(".json") ? "" : ".json";
            return base + suffix;
        }
        throw new Error(
            `Unexpected entry object for updateExceptionsFileAt/exceptionDetailsUrlMapper: ${JSON.stringify(
                entry,
                null,
                2
            )}`
        );
    };
    const exceptionDetailsObjectMapper = (_licenses: any[]) => {
        return (entry: any) => {
            return {
                name: entry.name,
                licenseExceptionId: entry.licenseExceptionId,
                licenseExceptionText: entry.licenseExceptionText,
                licenseExceptionTemplate: entry.licenseExceptionTemplate,
                isDeprecated: !!entry.isDeprecatedLicenseId,
                source: entry.source,
            };
        };
    };
    try {
        const licenses = readLicensesFromFile(licensesFilePath);
        await updateFileFromURL(
            exceptionsFilePath,
            EXCEPTIONS_FILE_URL,
            "exceptions",
            exceptionDetailsUrlMapper,
            exceptionDetailsObjectMapper(licenses)
        );
    } catch (err) {
        console.error(`Updating ${exceptionsFilePath} failed: ${err}`, err);
    }
};

const updateLicenseFileIfOlderThan = async (oldestAcceptableTimestamp: Date, filePath: string) => {
    if (!existsSync(filePath) || fileIsOlderThan(oldestAcceptableTimestamp, filePath) || !fileIsValidJson(filePath)) {
        return await updateLicenseFileAt(filePath);
    } else {
        console.log(`Not updating ${filePath} (it's recent enough)`);
    }
};

const updateExceptionsFileIfOlderThan = async (
    oldestAcceptableTimestamp: Date,
    filePath: string,
    licenseFilePath: string
) => {
    if (!existsSync(filePath) || fileIsOlderThan(oldestAcceptableTimestamp, filePath) || !fileIsValidJson(filePath)) {
        return await updateExceptionsFileAt(filePath, licenseFilePath);
    } else {
        console.log(`Not updating ${filePath} (it's recent enough)`);
    }
};

const dateHoursBeforeNow = (hours: number): Date => {
    const d = new Date();
    const nowInMillis = d.getTime();
    return new Date(nowInMillis - hours * 60 * 60 * 1000);
};

const main = async (licenseFilePath: string, exceptionsFilePath: string) => {
    const oldestAcceptableTimestamp = dateHoursBeforeNow(24);
    await updateLicenseFileIfOlderThan(oldestAcceptableTimestamp, licenseFilePath);
    await updateExceptionsFileIfOlderThan(oldestAcceptableTimestamp, exceptionsFilePath, licenseFilePath);
};

export type GeneratedLicenseData = {
    licenses: Licenses;
    exceptions: Exceptions;
};

export { Licenses, Exceptions };

/**
 * Create or update the license data files and return the generated license data.
 *
 * @param pathToLicensesFile `string` path to the licenses file (where it should be written if it doesn't exist yet)
 * @param pathToExceptionsFile `string` path to the exceptions file (where it should be written if it doesn't exist yet)
 * @returns `Promise` of the generated license data.
 */
export const generateLicenseData = async (
    pathToLicensesFile: string,
    pathToExceptionsFile: string
): Promise<GeneratedLicenseData> => {
    // TODO: should we (recursively) create the path to the licenses/exceptions file if the path doesn't exist yet?
    await main(pathToLicensesFile, pathToExceptionsFile);
    return {
        licenses: JSON.parse(readFileAsString(pathToLicensesFile)),
        exceptions: JSON.parse(readFileAsString(pathToExceptionsFile)),
    };
};
