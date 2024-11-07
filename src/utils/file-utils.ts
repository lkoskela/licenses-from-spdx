import { existsSync, statSync, readFileSync } from 'fs'

type ReadFileSyncOptions = { encoding: BufferEncoding, flag?: string | undefined } | BufferEncoding


export const isFile = (f: string|undefined): boolean => {
    return !!f && existsSync(f) && statSync(f).isFile()
}

export const isDirectory = (f: string|undefined): boolean => {
    return !!f && existsSync(f) && statSync(f).isDirectory()
}

export const readFileAsString = (f: string, options?: ReadFileSyncOptions): string => {
    return readFileSync(f, options || { encoding: 'utf8' }).toString()
}

export const fileIsOlderThan = (oldestAcceptableTimestamp: Date, filePath: string): boolean => {
    return statSync(filePath).mtime < oldestAcceptableTimestamp
}

export const fileIsValidJson = (filePath: string): boolean => {
    try {
        JSON.parse(readFileSync(filePath).toString())
        return true
    } catch {
        return false
    }
}
