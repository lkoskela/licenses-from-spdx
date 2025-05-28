import { mkdtempSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { generateLicenseData, GeneratedLicenseData, Licenses, License, Exceptions, Exception } from '../src/index'

describe('Smoke Test', () => {

    let licensesFilePath: string
    let exceptionsFilePath: string
    let generatedData: GeneratedLicenseData

    beforeAll(async () => {
        const folder = mkdtempSync(join(tmpdir(), 'foo-'))
        licensesFilePath = join(folder, 'licenses.json')
        exceptionsFilePath = join(folder, 'exceptions.json')
        console.log(`Generating license data at ${licensesFilePath} and license exception data at ${exceptionsFilePath}`)
        generatedData = await generateLicenseData(licensesFilePath, exceptionsFilePath)
    }, 60000)

    describe('Generated files', () => {

        it('files should be generated', () => {
            expect(statSync(licensesFilePath).isFile()).toBe(true)
            expect(statSync(exceptionsFilePath).isFile()).toBe(true)
        })

        it('should contain 0BSD license', () => {
            const licenses = JSON.parse(readFileSync(licensesFilePath).toString())
            expect(Array.isArray(licenses.licenses)).toBe(true)
            const zeroBsd = licenses.licenses.find((license: License) => license.licenseId === '0BSD')
            expect(zeroBsd).toBeDefined()
        })

        it('should contain Autoconf-exception-2.0', () => {
            const exceptions = JSON.parse(readFileSync(exceptionsFilePath).toString())
            expect(Array.isArray(exceptions.exceptions)).toBe(true)
            const autoconfException = exceptions.exceptions.find((exception: Exception) => exception.licenseExceptionId === 'Autoconf-exception-2.0')
            expect(autoconfException).toBeDefined()
        })
    })

    describe('Returned data', () => {

        it('licenses contain 0BSD', () => {
            const data = generatedData.licenses
            expect(Array.isArray(data.licenses)).toBe(true)
            const zeroBsd = data.licenses.find((license: License) => license.licenseId === '0BSD')
            expect(zeroBsd).toBeDefined()
        })

        it('exceptions contain Autoconf-exception-2.0', () => {
            const data = generatedData.exceptions
            expect(Array.isArray(data.exceptions)).toBe(true)
            const autoconfException = data.exceptions.find((exception: Exception) => exception.licenseExceptionId === 'Autoconf-exception-2.0')
            expect(autoconfException).toBeDefined()
        })
    })
})
