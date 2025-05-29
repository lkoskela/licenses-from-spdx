#!/usr/bin/env node

import { tmpdir } from 'os'
import { parseArgs } from 'node:util'
import { join, dirname } from 'path'

import { generateLicenseData, GeneratedLicenseData } from '../api/api'
import { isFile, isDirectory } from '../utils/file-utils'


export type UpdateLicenseDataParams = {
    licenses: string|undefined,
    exceptions: string|undefined,
    excludeText: boolean
};

const resolveOutputPath = (path: string | undefined, defaultDirectory: string|undefined, defaultFilename: string) => {
    if (path === undefined) {
        return join(defaultDirectory || tmpdir(), defaultFilename)
    }
    if (isFile(path)) {
        return path
    }
    if (isDirectory(path)) {
        return join(path, defaultFilename)
    }
    // TODO: should we create the directory path leading to the file?
    return path
}

export const updateLicenseData = (params: UpdateLicenseDataParams): Promise<GeneratedLicenseData> => {
    const { licenses, exceptions, excludeText } = params
    const pathToLicenseFile = resolveOutputPath(licenses, process.cwd(), 'licenses.json')
    const pathToExceptionsFile = resolveOutputPath(exceptions, dirname(pathToLicenseFile), 'exceptions.json')
    return generateLicenseData(pathToLicenseFile, pathToExceptionsFile, excludeText)
};

if (require.main === module) {
    // Grab the file paths for the licenses and exceptions files from CLI args
    const { values: { licenses, exceptions, excludeText, help } } = parseArgs({
        options: {
            licenses: { type: 'string', short: 'l' },
            exceptions: { type: 'string', short: 'e' },
            excludeText: { type: 'boolean', short: 'x', default: false },
            help: { type: 'boolean', short: 'h' }
        }
    })

    if (help) {
        console.log(`Usage: ${process.argv[1]} [-l|--licenses <licenses-file>] [-e|--exceptions <exceptions-file>] [-x|--exclude-text]`)
        process.exit(0)
    }

    const pathToLicenseFile = resolveOutputPath(licenses, process.cwd(), 'licenses.json')
    const pathToExceptionsFile = resolveOutputPath(exceptions, dirname(pathToLicenseFile), 'exceptions.json')
    console.log(`Writing licenses to:    ${pathToLicenseFile}`)
    console.log(`Writing exceptions to:  ${pathToExceptionsFile}`)

    generateLicenseData(pathToLicenseFile, pathToExceptionsFile, excludeText).then((_: GeneratedLicenseData) => {
        console.log(`Updated data\n`)
        console.log(`Licenses:\n${pathToLicenseFile}`)
        console.log(`Exceptions:\n${pathToExceptionsFile}`)
    })
}
