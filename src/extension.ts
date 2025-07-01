import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "json-minify.minify",
    () => {
      minifyJsonInActiveEditor();
    }
  );
  context.subscriptions.push(disposable);
}

function minifyJsonInActiveEditor(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const document = editor.document;
  if (document.languageId !== "json" && document.languageId !== "jsonc") {
    return;
  }
  const text = document.getText();
  const cleanedText =
    document.languageId === "jsonc" ? stripJsonComments(text) : text;
  const parsedJson = safeParseJson(cleanedText);
  if (parsedJson.error) {
    return;
  }
  const minifiedJson = JSON.stringify(parsedJson.data);
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(text.length)
  );
  editor.edit((editBuilder) => {
    editBuilder.replace(fullRange, minifiedJson);
  });
}

function safeParseJson(text: string) {
  try {
    return { data: JSON.parse(text) };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
}

function stripJsonComments(text: string): string {
  text = text.replace(/\/\/.*$/gm, "");
  text = text.replace(/\/\*[\s\S]*?\*\//g, "");
  return text;
}

export function deactivate() {}
