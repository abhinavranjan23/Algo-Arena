const axios = require("axios");

async function executeCode(code, language, testCases) {
  const results = [];
  let allPassed = true;

  for (let test of testCases) {
    let args;

    // ✅ Parse arguments safely
    try {
      args = JSON.parse(`[${test.input}]`);
    } catch (parseError) {
      results.push({
        input: test.input,
        expectedOutput: test.expectedOutput,
        output: "",
        errors: "Invalid input format: " + parseError.message,
        passed: false,
      });
      allPassed = false;
      continue;
    }

    try {
      const response = await axios.post(
        "http://localhost:9000/2015-03-31/functions/function/invocations",
        { language, code, args }
      );

      let body;
      try {
        body =
          typeof response.data.body === "string"
            ? JSON.parse(response.data.body)
            : response.data.body;
      } catch (e) {
        body = { output: "", errors: "Failed to parse response: " + e.message };
      }

      const output = (body.output || "").trim();
      const expected = test.expectedOutput.trim();

      const parseIfPossible = (str) => {
        try {
          return JSON.parse(str);
        } catch {
          return str;
        }
      };

      const expectedParsed = parseIfPossible(expected);
      const outputParsed = parseIfPossible(output);

      const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

      const passed = deepEqual(expectedParsed, outputParsed);

      results.push({
        input: test.input,
        expectedOutput: expected,
        output,
        errors: body.errors || "",
        passed,
      });

      if (!passed) allPassed = false;
    } catch (err) {
      console.error(`❌ Error running test: ${test.input}`, err.message);

      results.push({
        input: test.input,
        expectedOutput: test.expectedOutput,
        output: "",
        errors: err.message,
        passed: false,
      });
      allPassed = false;
    }
  }

  return { passed: allPassed, results };
}

module.exports = executeCode;
