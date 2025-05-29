import { pipeline } from "stream";
import * as path from "path";
import { get } from "https";
import { readFileSync, createWriteStream, unlinkSync } from "fs";
import { tmpdir } from "os";
import { hash } from "./hash";

/**
 * Downloads the content from the provided URL and returns it as a string.
 *
 * @param url URL to download the content from
 * @returns The content from the URL as a string
 */
export async function downloadRawContentFrom(url: string): Promise<any> {
    return await new Promise<string>((resolve, _reject) => {
        const tmpFilePath = path.join(tmpdir(), hash(url));
        get(url, { agent: false }, (response) => {
            const callback = (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    console.warn(`Could not download content from ${url} - ${err}`);
                    resolve("{}");
                } else {
                    resolve(readFileSync(tmpFilePath).toString());
                }
                unlinkSync(tmpFilePath);
                response.destroy();
            };
            pipeline(response, createWriteStream(tmpFilePath), callback);
        });
    });
}
