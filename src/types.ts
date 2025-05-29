export type Exception = {
    name: string,
    licenseExceptionId: string,
    licenseExceptionText: string,
    licenseExceptionTemplate: string,
    licenseComments?: string,
    isDeprecated?: boolean,
    source?: string,
    relatedLicenses?: string[],
}

export type License = {
    name: string,
    licenseId: string,
    licenseText: string,
    isDeprecated: boolean,
    seeAlso: string[],
}

export type Licenses = {
    licenseListVersion: string,
    releaseDate: string,
    licenses: License[]
}

export type Exceptions = {
    licenseListVersion: string,
    releaseDate: string,
    exceptions: Exception[]
}
