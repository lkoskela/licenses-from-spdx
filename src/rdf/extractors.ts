
export function getBooleanValueFromRoot(
    node: any,
    nsRdf: string,
    childName: string,
    defaultValue: boolean = false
): boolean {
    let childNode = node[childName];
    if (childNode && childNode["#text"] !== undefined) {
        if (childNode["@"][`${nsRdf}:datatype`] !== "http://www.w3.org/2001/XMLSchema#boolean") {
            console.warn(`Unexpected datatype for a boolean: ${JSON.stringify(childNode, null, 2)}`);
        }
        return childNode["#text"];
    }
    return defaultValue;
};

export function getIntegerValueFromRoot(node: any, nsRdf: string, childName: string, defaultValue: number = 0): number {
    let childNode = node[childName];
    if (childNode && childNode["#text"] !== undefined) {
        if (childNode["@"][`${nsRdf}:datatype`] !== "http://www.w3.org/2001/XMLSchema#int") {
            console.warn(`Unexpected rdf:datatype for an integer: ${JSON.stringify(childNode, null, 2)}`);
        }
        return childNode["#text"];
    }
    return defaultValue;
};

export function getStringValueFromRoot(node: any, nsRdf: string, childName: string): string | undefined {
    let childNode = node[childName];
    if (childNode && typeof childNode === "string") return childNode.trim();
    return undefined;
};

export function getStringAttribute(node: any, attributeName: string): string | undefined {
    return node['@'][attributeName];
}