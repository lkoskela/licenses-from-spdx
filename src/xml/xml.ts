import { XMLParser } from "fast-xml-parser";

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
