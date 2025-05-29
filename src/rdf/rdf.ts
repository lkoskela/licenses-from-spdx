import { Namespaces } from "../xml/xml";
import { getBooleanValueFromRoot, getIntegerValueFromRoot, getStringValueFromRoot } from "./extractors";

export function convertSpdxLicenseXmlToJsonObject(licenseId: string, listedLicense: any, namespaces: Namespaces): any {
    const nsRdf = namespaces.byUri("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    const nsSpdx = namespaces.byUri("http://spdx.org/rdf/terms#");
    const nsRdfs = namespaces.byUri("http://www.w3.org/2000/01/rdf-schema#");

    licenseId = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:licenseId`) || licenseId;
    let isOsiApproved = getBooleanValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:isOsiApproved`);
    let isFsfLibre = getBooleanValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:isFsfLibre`);
    let isDeprecatedLicenseId = getBooleanValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:isDeprecatedLicenseId`);
    let name = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:name`);
    let standardLicenseHeader = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:standardLicenseHeader`);
    let standardLicenseHeaderHtml = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:standardLicenseHeaderHtml`);
    let standardLicenseHeaderTemplate = getStringValueFromRoot(
        listedLicense,
        nsRdf,
        `${nsSpdx}:standardLicenseHeaderTemplate`
    );
    let standardLicenseTemplate = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:standardLicenseTemplate`);
    let licenseText = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:licenseText`);
    let licenseTextHtml = getStringValueFromRoot(listedLicense, nsRdf, `${nsSpdx}:licenseTextHtml`);
    let licenseComments = getStringValueFromRoot(listedLicense, nsRdf, `${nsRdfs}:comment`);

    let seeAlso = listedLicense[`${nsRdfs}:seeAlso`];
    if (seeAlso === undefined) {
        seeAlso = [];
    } else if (!Array.isArray(seeAlso)) {
        seeAlso = typeof seeAlso === "string" ? [seeAlso] : [];
    }

    const mapCrossRef = (node: any): any => {
        let element = node[`${nsSpdx}:CrossRef`];
        let order = getIntegerValueFromRoot(element, nsRdf, `${nsSpdx}:order`);
        let match = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:match`).toString();
        let url = getStringValueFromRoot(element, nsRdf, `${nsSpdx}:url`);
        let isValid = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isValid`);
        let isLive = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isLive`);
        let isWayBackLink = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isWayBackLink`);
        let timestamp = getStringValueFromRoot(element, nsRdf, `${nsSpdx}:timestamp`);
        return { order, match, url, isValid, isLive, isWayBackLink, timestamp };
    };
    let crossRef = listedLicense[`${nsSpdx}:crossRef`];
    if (crossRef === undefined) {
        crossRef = [];
    } else if (Array.isArray(crossRef)) {
        crossRef = crossRef.map(mapCrossRef);
    } else if (typeof crossRef === "object") {
        crossRef = [mapCrossRef(crossRef)];
    }
    const jsonizedLicenseObject = {
        isDeprecatedLicenseId,
        isFsfLibre,
        licenseText,
        licenseComments,
        standardLicenseHeaderTemplate,
        standardLicenseTemplate,
        name,
        licenseId,
        standardLicenseHeader,
        crossRef,
        seeAlso,
        isOsiApproved,
        licenseTextHtml,
        standardLicenseHeaderHtml,
    };
    return jsonizedLicenseObject;
}

export function convertSpdxLicenseExceptionXmlToJsonObject(
    licenseExceptionId: string,
    listedLicenseException: any,
    namespaces: Namespaces
): any {
    const nsRdf = namespaces.byUri("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
    const nsSpdx = namespaces.byUri("http://spdx.org/rdf/terms#");
    const nsRdfs = namespaces.byUri("http://www.w3.org/2000/01/rdf-schema#");

    licenseExceptionId =
        getStringValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:licenseExceptionId`) || licenseExceptionId;
    let name = getStringValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:name`);
    let licenseExceptionText = getStringValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:licenseExceptionText`);
    let licenseExceptionTextHtml = getStringValueFromRoot(listedLicenseException, nsRdf, `${nsSpdx}:exceptionTextHtml`);
    let licenseExceptionTemplate = getStringValueFromRoot(
        listedLicenseException,
        nsRdf,
        `${nsSpdx}:licenseExceptionTemplate`
    );
    let licenseComments = getStringValueFromRoot(listedLicenseException, nsRdf, `${nsRdfs}:comment`);

    let isDeprecatedLicenseId = getBooleanValueFromRoot(
        listedLicenseException,
        nsRdf,
        `${nsSpdx}:isDeprecatedLicenseId`
    );

    let seeAlso = listedLicenseException[`${nsRdfs}:seeAlso`];
    if (seeAlso === undefined) {
        seeAlso = [];
    } else if (!Array.isArray(seeAlso)) {
        seeAlso = typeof seeAlso === "string" ? [seeAlso] : [];
    }

    const mapCrossRef = (node: any): any => {
        let element = node[`${nsSpdx}:CrossRef`];
        let order = getIntegerValueFromRoot(element, nsRdf, `${nsSpdx}:order`);
        let match = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:match`).toString();
        let url = getStringValueFromRoot(element, nsRdf, `${nsSpdx}:url`);
        let isValid = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isValid`);
        let isLive = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isLive`);
        let isWayBackLink = getBooleanValueFromRoot(element, nsRdf, `${nsSpdx}:isWayBackLink`);
        let timestamp = getStringValueFromRoot(element, nsRdf, `${nsSpdx}:timestamp`);
        return { order, match, url, isValid, isLive, isWayBackLink, timestamp };
    };
    let crossRef = listedLicenseException[`${nsSpdx}:crossRef`];
    if (crossRef === undefined) {
        crossRef = [];
    } else if (Array.isArray(crossRef)) {
        crossRef = crossRef.map(mapCrossRef);
    } else if (typeof crossRef === "object") {
        crossRef = [mapCrossRef(crossRef)];
    }
    const jsonizedLicenseObject = {
        licenseExceptionId,
        name,
        licenseExceptionText,
        licenseExceptionTextHtml,
        licenseExceptionTemplate,
        licenseComments,
        isDeprecatedLicenseId,
        crossRef,
        seeAlso,
    };
    return jsonizedLicenseObject;
}
