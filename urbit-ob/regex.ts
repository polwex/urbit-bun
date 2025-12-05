import { prefixes, suffixes } from "./src/co";

// --- 2. Create the Alternation Strings ---
// We join the lists with '|' (OR operator in regex).
// We wrap them in non-capturing groups '(?:...)' for efficiency
// as we likely don't need to capture these parts separately.
// Note: Since Urbit syllables are just 'a-z', no special regex character escaping needed.
const prefixAlternation = `(?:${prefixes.join("|")})`;
const suffixAlternation = `(?:${suffixes.join("|")})`;

// --- 3. Construct the Final Regex Pattern String ---
// Structure: ^~( Planet | Star | Galaxy )$
// Planet: P S - P S
// Star:   P S
// Galaxy: S
// We use template literals for easier readability.
const urbitIdPatternString = `~(?:${prefixAlternation}${suffixAlternation}-${prefixAlternation}${suffixAlternation}|${prefixAlternation}${suffixAlternation}|${suffixAlternation})`;

// --- 4. Create the RegExp Object ---
// This compiles the pattern string into a usable RegExp object.
// This compilation step happens once.
export const urbitIdRegex = new RegExp(urbitIdPatternString, "g");

// --- 5. Usage Example ---
// You can now use this regex to test strings.

function isValidUrbitId(id: string) {
  // The .test() method returns true if the string matches the pattern, false otherwise.
  // return urbitIdRegex.test(id);
  return id.match(urbitIdRegex);
}

// --- Testing ---
// Assuming 'zod' is a suffix, 'mar' is a prefix, 'bin' is a prefix, 'nec' is a suffix
// and 'sampel-palnet' uses valid P/S pairs.

// console.log(`Testing ~zod: ${isValidUrbitId("~zod")}`); // Expect true (Galaxy)
// console.log(`Testing ~marzod: ${isValidUrbitId("~marzod")}`); // Expect true (Star)
// console.log(`Testing ~binnec: ${isValidUrbitId("~binnec")}`); // Expect true (Star)

// console.log(`Testing ~sampel-palnet: ${isValidUrbitId("~sampel-palnet")}`); // Expect true (Planet)
// console.log(
//   `Testing ~docteg-mothep: ${isValidUrbitId("~docteg-mothep is a good boy")}`,
// ); // Expect true (Planet)
// console.log(
//   `Testing several: ${isValidUrbitId("~docteg-mothep is a good boy but ~zod is weird")}`,
// ); // Expect true (Planet)

// // Negative tests
// console.log(`Testing ~mar: ${isValidUrbitId("~mar")}`); // Expect false (too short, not a suffix)
// console.log(`Testing ~marzodnex: ${isValidUrbitId("~marzodnex")}`); // Expect false (too long for a Star)
// console.log(`Testing marzod: ${isValidUrbitId("marzod")}`); // Expect false (missing '~')
// console.log(`Testing ~mar-zod: ${isValidUrbitId("~mar-zod")}`); // Expect false (invalid structure for Star)
// console.log(`Testing ~sampel-pal: ${isValidUrbitId("~sampel-pal")}`); // Expect false (incomplete Planet)
// console.log(`Testing ~qaz: ${isValidUrbitId("~qaz")}`); // Expect false (assuming 'qaz' is not a suffix)
// console.log(`Testing ~doz-nec-bin-wan: ${isValidUrbitId("~doz-nec-bin-wan")}`); // Expect false (wrong hyphen structure for Planet)
