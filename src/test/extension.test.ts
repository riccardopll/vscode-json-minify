import * as assert from "assert";
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

suite("JSON Tools Test Suite", () => {
  const resourcesPath = path.join(__dirname, "resources");

  async function loadTestFile(filename: string) {
    const filePath = path.join(resourcesPath, filename);
    return fs.readFileSync(filePath, "utf8");
  }

  async function executeCommandOnSelection(
    content: string,
    language: string,
    command: string
  ) {
    const document = await vscode.workspace.openTextDocument({
      content,
      language,
    });
    const editor = await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand(command);
    await new Promise((resolve) => setTimeout(resolve, 100));
    const result = editor.document.getText();
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
    return result;
  }

  test("Minify valid JSON", async () => {
    const jsonContent = await loadTestFile("valid.json");
    const expectedMinified =
      '{"name":"test","version":"1.0.0","description":"A test JSON file","nested":{"array":[1,2,3],"boolean":true,"null":null}}';
    const result = await executeCommandOnSelection(
      jsonContent,
      "json",
      "json-minify.minify"
    );
    assert.strictEqual(
      result,
      expectedMinified,
      "JSON should be minified correctly"
    );
  });

  test("Handle invalid JSON gracefully", async () => {
    const invalidJsonContent = await loadTestFile("invalid.json");
    const result = await executeCommandOnSelection(
      invalidJsonContent,
      "json",
      "json-minify.minify"
    );
    assert.strictEqual(
      result,
      invalidJsonContent,
      "Invalid JSON should not be modified"
    );
  });

  test("Handle empty JSON object", async () => {
    const emptyJsonContent = "{}";
    const result = await executeCommandOnSelection(
      emptyJsonContent.trim(),
      "json",
      "json-minify.minify"
    );
    assert.strictEqual(result, "{}", "Empty JSON object should remain as {}");
  });

  test("Handle non-JSON file", async () => {
    const textContent = "This is not a JSON file";
    const result = await executeCommandOnSelection(
      textContent,
      "plaintext",
      "json-minify.minify"
    );
    assert.strictEqual(
      result,
      textContent,
      "Non-JSON file should not be modified"
    );
  });

  test("Handle JSONC", async () => {
    const jsoncContent = await loadTestFile("valid.jsonc");
    const expectedMinified =
      '{"name":"test","version":"1.0.0","description":"A test JSONC file","nested":{"array":[1,2,3],"boolean":true}}';
    const result = await executeCommandOnSelection(
      jsoncContent,
      "jsonc",
      "json-minify.minify"
    );
    assert.strictEqual(
      result,
      expectedMinified,
      "JSONC should be minified correctly with comments removed"
    );
  });

  test("Stringify valid JSON", async () => {
    const jsonContent = await loadTestFile("valid.json");
    const expectedStringified =
      '"{\\"name\\":\\"test\\",\\"version\\":\\"1.0.0\\",\\"description\\":\\"A test JSON file\\",\\"nested\\":{\\"array\\":[1,2,3],\\"boolean\\":true,\\"null\\":null}}"';
    const result = await executeCommandOnSelection(
      jsonContent,
      "json",
      "json-minify.stringify"
    );
    assert.strictEqual(
      result,
      expectedStringified,
      "JSON should be stringified correctly"
    );
  });

  test("Stringify JSONC", async () => {
    const jsoncContent = await loadTestFile("valid.jsonc");
    const expectedStringified =
      '"{\\"name\\":\\"test\\",\\"version\\":\\"1.0.0\\",\\"description\\":\\"A test JSONC file\\",\\"nested\\":{\\"array\\":[1,2,3],\\"boolean\\":true}}"';
    const result = await executeCommandOnSelection(
      jsoncContent,
      "jsonc",
      "json-minify.stringify"
    );
    assert.strictEqual(
      result,
      expectedStringified,
      "JSONC should be stringified correctly with comments removed"
    );
  });

  test("Stringify empty JSON", async () => {
    const emptyJsonContent = "{}";
    const expectedStringified = '"{}"';
    const result = await executeCommandOnSelection(
      emptyJsonContent.trim(),
      "json",
      "json-minify.stringify"
    );
    assert.strictEqual(
      result,
      expectedStringified,
      "Empty JSON should be stringified correctly"
    );
  });

  test("Deserialize stringified JSON", async () => {
    const stringifiedJson =
      '"{\\"name\\":\\"test\\",\\"version\\":\\"1.0.0\\"}"';
    const expectedDeserialized = '{"name":"test","version":"1.0.0"}';
    const result = await executeCommandOnSelection(
      stringifiedJson,
      "json",
      "json-minify.deserialize"
    );
    assert.strictEqual(
      result,
      expectedDeserialized,
      "Stringified JSON should be deserialized correctly"
    );
  });

  test("Deserialize handles invalid stringified JSON gracefully", async () => {
    const invalidStringifiedJson = '"invalid json string"';
    const result = await executeCommandOnSelection(
      invalidStringifiedJson,
      "json",
      "json-minify.deserialize"
    );
    assert.strictEqual(
      result,
      invalidStringifiedJson,
      "Invalid stringified JSON should not be modified"
    );
  });

  test("Handle stringify with invalid JSON gracefully", async () => {
    const invalidJsonContent = await loadTestFile("invalid.json");
    const result = await executeCommandOnSelection(
      invalidJsonContent,
      "json",
      "json-minify.stringify"
    );
    assert.strictEqual(
      result,
      invalidJsonContent,
      "Invalid JSON should not be modified when stringifying"
    );
  });

  test("Minify JSON with stringified content", async () => {
    const jsonContent = await loadTestFile("valid_with_stringified.json");
    const expectedMinified =
      '{"name":"test","version":"1.0.0","description":"A test JSON file","nested":{"array":[1,2,3],"boolean":true,"null":null},"stringified":"{\\"name\\":\\"test\\",\\"version\\":\\"1.0.0\\",\\"description\\":\\"A test JSON file\\",\\"url\\":\\"https://example.com/api/test\\",\\"nested\\":{\\"array\\":[1,2,3],\\"boolean\\":true,\\"null\\":null}}"}';
    const result = await executeCommandOnSelection(
      jsonContent,
      "json",
      "json-minify.minify"
    );
    assert.strictEqual(
      result,
      expectedMinified,
      "JSON with stringified content should be minified correctly"
    );
  });

  test("Stringify JSON with stringified content", async () => {
    const jsonContent = await loadTestFile("valid_with_stringified.json");
    const expectedStringified =
      '"{\\"name\\":\\"test\\",\\"version\\":\\"1.0.0\\",\\"description\\":\\"A test JSON file\\",\\"nested\\":{\\"array\\":[1,2,3],\\"boolean\\":true,\\"null\\":null},\\"stringified\\":\\"{\\\\\\"name\\\\\\":\\\\\\"test\\\\\\",\\\\\\"version\\\\\\":\\\\\\"1.0.0\\\\\\",\\\\\\"description\\\\\\":\\\\\\"A test JSON file\\\\\\",\\\\\\"url\\\\\\":\\\\\\"https://example.com/api/test\\\\\\",\\\\\\"nested\\\\\\":{\\\\\\"array\\\\\\":[1,2,3],\\\\\\"boolean\\\\\\":true,\\\\\\"null\\\\\\":null}}\\"}"';
    const result = await executeCommandOnSelection(
      jsonContent,
      "json",
      "json-minify.stringify"
    );
    assert.strictEqual(
      result,
      expectedStringified,
      "JSON with stringified content should be stringified correctly"
    );
  });
});
