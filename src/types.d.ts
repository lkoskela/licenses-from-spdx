export type Exception = {
    licenseExceptionId: string,
    licenseExceptionText: string,
    licenseExceptionTemplate: string,
    name: string
}

export type License = {
    name: string,
    licenseId: string,
    licenseText: string,
    isDeprecated: boolean,
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
