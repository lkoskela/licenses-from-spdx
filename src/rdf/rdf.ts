
type NamespaceMappings = {
    [name: string]: string
}

type Namespaces = {
    byUri(uri: string): string
}

const parseNamespaces = (mappings: NamespaceMappings|undefined): Namespaces => {
    const keyedByPrefix: { [name:string]: string } = {}
    const keyedByURI: { [name:string]: string } = {}
    if (mappings) {
        Object.keys(mappings).forEach(ns => {
            let prefix = ns.replace(/^xmlns:/, '')
            let uri = mappings[ns]
            keyedByPrefix[prefix] = uri
            keyedByURI[uri] = prefix
        })
    }
    const byUri = (uri: string): string => { return keyedByURI[uri] || '' }
    return { byUri }
}

const getBooleanValueFromRoot = (node: any, nsRdf: string, childName: string, defaultValue: boolean = false): boolean => {
    let childNode = node[childName]
    if (childNode && childNode["#text"] !== undefined) {
        if (childNode["@"][`${nsRdf}:datatype`] !== "http://www.w3.org/2001/XMLSchema#boolean") {
            console.warn(`Unexpected datatype for a boolean: ${JSON.stringify(childNode, null, 2)}`)
        }
        return childNode["#text"]
    }
    return defaultValue
}

const getIntegerValueFromRoot = (node: any, nsRdf: string, childName: string, defaultValue: number = 0): number => {
    let childNode = node[childName]
    if (childNode && childNode["#text"] !== undefined) {
        if (childNode["@"][`${nsRdf}:datatype`] !== "http://www.w3.org/2001/XMLSchema#int") {
            console.warn(`Unexpected rdf:datatype for an integer: ${JSON.stringify(childNode, null, 2)}`)
        }
        return childNode["#text"]
    }
    return defaultValue
}

const getStringValueFromRoot = (node: any, nsRdf: string, childName: string): string|undefined => {
    let childNode = node[childName]
    if (childNode && typeof(childNode) === 'string') return childNode.trim()
    return undefined
}

export function convertSpdxXmlToJsonObject(doc: any, licenseId: string): any {
    let root = doc[Object.keys(doc)[0]]
    let namespaces = parseNamespaces(root["@"])
    let nsRdf = namespaces.byUri('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
    let nsSpdx = namespaces.byUri('http://spdx.org/rdf/terms#')
    let nsRdfs = namespaces.byUri('http://www.w3.org/2000/01/rdf-schema#')

    let listedLicense = root[`${nsSpdx}:ListedLicense`]
    if (listedLicense) {
        return convertSpdxLicenseXmlToJsonObject(licenseId, listedLicense, nsRdf, nsSpdx, nsRdfs)
    }

    let listedLicenseException = root[`${nsSpdx}:ListedLicenseException`]
    if (listedLicenseException) {
        return convertSpdxLicenseExceptionXmlToJsonObject(licenseId, listedLicenseException, nsRdf, nsSpdx, nsRdfs)
    }

    return undefined
}

function convertSpdxLicenseXmlToJsonObject(licenseId: string,listedLicense: any, nsRdf: string, nsSpdx: string, nsRdfs: string): any {
    licenseId = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:licenseId`) || licenseId
    let isOsiApproved = getBooleanValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:isOsiApproved`)
    let isFsfLibre = getBooleanValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:isFsfLibre`)
    let isDeprecatedLicenseId = getBooleanValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:isDeprecatedLicenseId`)
    let name = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:name`)
    let standardLicenseHeader = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:standardLicenseHeader`)
    let standardLicenseHeaderHtml = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:standardLicenseHeaderHtml`)
    let standardLicenseHeaderTemplate = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:standardLicenseHeaderTemplate`)
    let standardLicenseTemplate = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:standardLicenseTemplate`)
    let licenseText = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:licenseText`)
    let licenseTextHtml = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:licenseTextHtml`)

    let seeAlso = listedLicense[`${nsRdfs}:seeAlso`]
    if (seeAlso === undefined) {
        seeAlso = []
    } else if (!Array.isArray(seeAlso)) {
        seeAlso = typeof(seeAlso) === 'string' ? [ seeAlso ] : []
    }

    const mapCrossRef = (node: any): any => {
        let element = node[`${nsSpdx}:CrossRef`]
        let order = getIntegerValueFromRoot(element, nsRdf, `${nsSpdx}:order`)
        let match = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:match`).toString()
        let url = getStringValueFromRoot(element, nsRdf, `${nsSpdx}:url`)
        let isValid = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isValid`)
        let isLive = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isLive`)
        let isWayBackLink = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isWayBackLink`)
        let timestamp = getStringValueFromRoot(element, nsRdf, `${nsSpdx}:timestamp`)
        return { order, match, url, isValid, isLive, isWayBackLink, timestamp }
    }
    let crossRef = listedLicense[`${nsSpdx}:crossRef`]
    if (crossRef === undefined) {
        crossRef = []
    } else if (Array.isArray(crossRef)) {
        crossRef = crossRef.map(mapCrossRef)
    } else if (typeof(crossRef) === 'object') {
        crossRef = [ mapCrossRef(crossRef) ]
    }
    const jsonizedLicenseObject = {
        isDeprecatedLicenseId,
        isFsfLibre,
        licenseText,
        standardLicenseHeaderTemplate,
        standardLicenseTemplate,
        name,
        licenseId,
        standardLicenseHeader,
        crossRef,
        seeAlso,
        isOsiApproved,
        licenseTextHtml,
        standardLicenseHeaderHtml
    }
    return jsonizedLicenseObject
}

function convertSpdxLicenseExceptionXmlToJsonObject(licenseExceptionId: string, listedLicenseException: any, nsRdf: string, nsSpdx: string, nsRdfs: string): any {
    licenseExceptionId = getStringValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:licenseExceptionId`) || licenseExceptionId
    let name = getStringValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:name`)
    let licenseExceptionText = getStringValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:licenseExceptionText`)
    let licenseExceptionTextHtml = getStringValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:exceptionTextHtml`)
    let licenseExceptionTemplate = getStringValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:licenseExceptionTemplate`)
    let isDeprecatedLicenseId = getBooleanValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:isDeprecatedLicenseId`)

    let seeAlso = listedLicenseException[`${nsRdfs}:seeAlso`]
    if (seeAlso === undefined) {
        seeAlso = []
    } else if (!Array.isArray(seeAlso)) {
        seeAlso = typeof(seeAlso) === 'string' ? [ seeAlso ] : []
    }

    const mapCrossRef = (node: any): any => {
        let element = node[`${nsSpdx}:CrossRef`]
        let order = getIntegerValueFromRoot(element, nsRdf, `${nsSpdx}:order`)
        let match = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:match`).toString()
        let url = getStringValueFromRoot(element, nsRdf, `${nsSpdx}:url`)
        let isValid = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isValid`)
        let isLive = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isLive`)
        let isWayBackLink = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isWayBackLink`)
        let timestamp = getStringValueFromRoot(element, nsRdf, `${nsSpdx}:timestamp`)
        return { order, match, url, isValid, isLive, isWayBackLink, timestamp }
    }
    let crossRef = listedLicenseException[`${nsSpdx}:crossRef`]
    if (crossRef === undefined) {
        crossRef = []
    } else if (Array.isArray(crossRef)) {
        crossRef = crossRef.map(mapCrossRef)
    } else if (typeof(crossRef) === 'object') {
        crossRef = [ mapCrossRef(crossRef) ]
    }
    const jsonizedLicenseObject = {
        licenseExceptionId,
        name,
        licenseExceptionText,
        licenseExceptionTextHtml,
        licenseExceptionTemplate,
        isDeprecatedLicenseId,
        crossRef,
        seeAlso,
    }
    return jsonizedLicenseObject
}
