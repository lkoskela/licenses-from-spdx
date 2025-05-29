import { BinaryLike, createHash } from "crypto";

/**
 * Hashes the provided data using SHA-1.
 *
 * @param data Input to hash
 * @returns SHA-1 hash of the input
 */
export function hash(data: string | BinaryLike): string {
    let shasum = createHash("sha1");
    shasum.update(data);
    return shasum.digest("hex");
}
