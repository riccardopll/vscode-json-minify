import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const minify = vscode.commands.registerCommand('json-minify.minify', minifyJsonInActiveEditor);
  const stringify = vscode.commands.registerCommand(
    'json-minify.stringify',
    stringifyJsonInActiveEditor
  );
  const deserialize = vscode.commands.registerCommand(
    'json-minify.deserialize',
    deserializeJsonInActiveEditor
  );
  context.subscriptions.push(minify, stringify, deserialize);
}

function minifyJsonInActiveEditor() {
  const { editor, selection, json, error } = getJsonSelection();
  if (error !== undefined) {
    return;
  }
  const minifiedJson = JSON.stringify(json);
  editor.edit((editBuilder: vscode.TextEditorEdit) => {
    editBuilder.replace(selection, minifiedJson);
  });
}

function stringifyJsonInActiveEditor() {
  const { editor, selection, json, error } = getJsonSelection();
  if (error !== undefined) {
    return;
  }
  const stringifiedJson = JSON.stringify(JSON.stringify(json));
  editor.edit((editBuilder) => {
    editBuilder.replace(selection, stringifiedJson);
  });
}

function deserializeJsonInActiveEditor() {
  const { editor, selection, json: firstParse, error } = getJsonSelection();
  if (error !== undefined) {
    return;
  }
  // should be a stringified JSON
  if (typeof firstParse !== 'string') {
    return;
  }
  const secondParse = safeParseJson(firstParse);
  if (secondParse.error) {
    return;
  }
  const deserializedJson = JSON.stringify(secondParse.data);
  editor.edit((editBuilder) => {
    editBuilder.replace(selection, deserializedJson);
  });
}

function getJsonSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return { error: 'No active editor' };
  }
  const selection = editor.selection.isEmpty
    ? new vscode.Selection(
        editor.document.positionAt(0),
        editor.document.positionAt(editor.document.getText().length)
      )
    : editor.selection;
  const text = editor.document.getText(selection);
  const cleanedText = stripJsonComments(text);
  const parsedJson = safeParseJson(cleanedText);
  if (parsedJson.error) {
    return { error: parsedJson.error };
  }
  return {
    editor,
    selection,
    json: parsedJson.data,
  };
}

function safeParseJson(text: string) {
  try {
    return { data: JSON.parse(text) };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

function stripJsonComments(text: string) {
  const result = text.replace(/"(?:[^"\\]|\\.)*"|\/\/.*$|\/\*[\s\S]*?\*\//gm, (match) => {
    // ignore matches that are inside quotes
    if (match.startsWith('"')) {
      return match;
    }
    return '';
  });
  // clean up trailing commas before closing brackets/braces (JSONC support)
  return result.replace(/,(\s*[}\]])/g, '$1');
}

export function deactivate() {}
