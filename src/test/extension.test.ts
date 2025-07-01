import * as assert from "assert";
import * as vscode from "vscode";

suite("Minify JSON", () => {
  test("minify valid JSON", async () => {
    const jsonContent = `{
  "name": "test",
  "version": "1.0.0",
  "description": "A test JSON file",
  "nested": {
    "array": [1, 2, 3],
    "boolean": true,
    "null": null
  }
}`;
    const expectedMinified =
      '{"name":"test","version":"1.0.0","description":"A test JSON file","nested":{"array":[1,2,3],"boolean":true,"null":null}}';
    const document = await vscode.workspace.openTextDocument({
      content: jsonContent,
      language: "json",
    });
    const editor = await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("json-minify.minify");
    await new Promise((resolve) => setTimeout(resolve, 100));
    const minifiedContent = editor.document.getText();
    assert.strictEqual(
      minifiedContent,
      expectedMinified,
      "JSON should be minified correctly"
    );
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("handle invalid JSON gracefully", async () => {
    const invalidJsonContent = `{
  "name": "test",
  "invalid": json
}`;
    const document = await vscode.workspace.openTextDocument({
      content: invalidJsonContent,
      language: "json",
    });
    const editor = await vscode.window.showTextDocument(document);
    const originalContent = editor.document.getText();
    await vscode.commands.executeCommand("json-minify.minify");
    await new Promise((resolve) => setTimeout(resolve, 100));
    const contentAfterCommand = editor.document.getText();
    assert.strictEqual(
      contentAfterCommand,
      originalContent,
      "Invalid JSON should not be modified"
    );
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("handle empty JSON object", async () => {
    const emptyJsonContent = "{}";
    const document = await vscode.workspace.openTextDocument({
      content: emptyJsonContent,
      language: "json",
    });
    const editor = await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("json-minify.minify");
    await new Promise((resolve) => setTimeout(resolve, 100));
    const minifiedContent = editor.document.getText();
    assert.strictEqual(
      minifiedContent,
      "{}",
      "Empty JSON object should remain as {}"
    );
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("handle JSON array", async () => {
    const jsonArrayContent = `[
  {
    "id": 1,
    "name": "item1"
  },
  {
    "id": 2,
    "name": "item2"
  }
]`;

    const expectedMinified =
      '[{"id":1,"name":"item1"},{"id":2,"name":"item2"}]';
    const document = await vscode.workspace.openTextDocument({
      content: jsonArrayContent,
      language: "json",
    });
    const editor = await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("json-minify.minify");
    await new Promise((resolve) => setTimeout(resolve, 100));
    const minifiedContent = editor.document.getText();
    assert.strictEqual(
      minifiedContent,
      expectedMinified,
      "JSON array should be minified correctly"
    );
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("handle non-JSON file", async () => {
    const textContent = "This is not a JSON file";
    const document = await vscode.workspace.openTextDocument({
      content: textContent,
      language: "plaintext",
    });
    const editor = await vscode.window.showTextDocument(document);
    const originalContent = editor.document.getText();
    await vscode.commands.executeCommand("json-minify.minify");
    await new Promise((resolve) => setTimeout(resolve, 100));
    const contentAfterCommand = editor.document.getText();
    assert.strictEqual(
      contentAfterCommand,
      originalContent,
      "Non-JSON file should not be modified"
    );
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });

  test("handle JSONC", async () => {
    const jsoncContent = `{
  // This is a single-line comment
  "name": "test",
  "version": "1.0.0", /* multi-line
  comment here */
  "description": "A test JSONC file",
  "nested": {
    // Another comment
    "array": [1, 2, 3],
    "boolean": true
  }
}`;

    const expectedMinified =
      '{"name":"test","version":"1.0.0","description":"A test JSONC file","nested":{"array":[1,2,3],"boolean":true}}';
    const document = await vscode.workspace.openTextDocument({
      content: jsoncContent,
      language: "jsonc",
    });
    const editor = await vscode.window.showTextDocument(document);
    await vscode.commands.executeCommand("json-minify.minify");
    await new Promise((resolve) => setTimeout(resolve, 100));
    const minifiedContent = editor.document.getText();
    assert.strictEqual(
      minifiedContent,
      expectedMinified,
      "JSONC should be minified correctly with comments removed"
    );
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});
