import { XMLParser } from "fast-xml-parser";

type NamespaceMappings = {
    [name: string]: string;
};

export interface Namespaces {
    byUri(uri: string): string;
}

export function parseNamespaces(mappings: NamespaceMappings | undefined): Namespaces {
    const keyedByPrefix: { [name: string]: string } = {};
    const keyedByURI: { [name: string]: string } = {};
    if (mappings) {
        Object.keys(mappings).forEach((ns) => {
            let prefix = ns.replace(/^xmlns:/, "");
            let uri = mappings[ns];
            keyedByPrefix[prefix] = uri;
            keyedByURI[uri] = prefix;
            keyedByURI[uri.replace(/#$/, "")] = prefix;
        });
    }
    const byUri = (uri: string): string => {
        return keyedByURI[uri] || keyedByURI[uri.replace(/#$/, "")] || "";
    };
    return { ...keyedByPrefix, byUri: byUri };
}

export function parseXML(rawXml: string, preserveOrder: boolean = true): any {
    const options = {
        ignoreAttributes: false,
        allowBooleanAttributes: true,
        preserveOrder: preserveOrder,
        attributeNamePrefix: "",
        attributesGroupName: "@",
        commentPropName: "#comment",
    };
    const parser = new XMLParser(options);
    const xml = parser.parse(rawXml);
    return xml;
}

export async function parseDownloadedXML(
    rawXml: string,
    source: string = "unknown source",
    preserveOrder: boolean = true
): Promise<{ root: any; namespaces: Namespaces }> {
    try {
        const doc = parseXML(rawXml, preserveOrder);
        const root = doc[Object.keys(doc)[0]];
        const namespaces = parseNamespaces(root["@"]);
        return { root, namespaces };
    } catch (err) {
        console.error(`Error parsing XML from ${source}: ${err}\n\nRaw content:\n${rawXml}`);
        return Promise.reject({
            error: `Error parsing XML from ${source}: ${err}`,
            details: `Raw content received:\n${rawXml}`,
        });
    }
}
