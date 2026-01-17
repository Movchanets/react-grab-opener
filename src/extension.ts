// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

interface ComponentInfo {
	componentName: string;
	filePath: string;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "react-grab-opener" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('react-grab-opener.openComponent', async () => {
		try {
			const clipboardText = await vscode.env.clipboard.readText();
			const componentInfos = parseClipboard(clipboardText);
			if (!componentInfos || componentInfos.length === 0) {
				vscode.window.showErrorMessage('No valid React components found in clipboard. Make sure you copied from React DevTools or react-grab tool.');
				return;
			}

			console.log(`Found ${componentInfos.length} component(s) to open`);

			// Remove duplicates based on filePath
			const uniqueComponents = componentInfos.filter((info, index, self) =>
				index === self.findIndex(i => i.filePath === info.filePath)
			);

			console.log(`Opening ${uniqueComponents.length} unique file(s)`);

			// Open each component file in a new tab
			for (let i = 0; i < uniqueComponents.length; i++) {
				const componentInfo = uniqueComponents[i];
				console.log(`Processing component: ${componentInfo.componentName} in ${componentInfo.filePath}`);
				
				const fileUri = await resolveFileUri(componentInfo.filePath);
				if (!fileUri) {
					console.log(`File not found: ${componentInfo.filePath}`);
					vscode.window.showWarningMessage(`Could not find file: ${componentInfo.filePath}`);
					continue;
				}

				console.log(`Opening file: ${fileUri.fsPath}`);
				const document = await vscode.workspace.openTextDocument(fileUri);
				
				// Open all files in the same tab group (Active column)
				// preserveFocus keeps focus on last file, except for the very last one
				const editor = await vscode.window.showTextDocument(document, { 
					viewColumn: vscode.ViewColumn.Active,
					preview: false, // Open as permanent tab, not preview
					preserveFocus: i < uniqueComponents.length - 1 
				});

				await navigateToComponent(editor, componentInfo.componentName);
			}

			const message = uniqueComponents.length === 1 
				? `Opened ${uniqueComponents[0].componentName}` 
				: `Opened ${uniqueComponents.length} files`;
			vscode.window.showInformationMessage(message);
		} catch (error) {
			vscode.window.showErrorMessage(`Error opening component: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	});

	context.subscriptions.push(disposable);
}

export function parseClipboard(text: string): ComponentInfo[] | null {
	// Check if there are multiple <selected_element> blocks
	const selectedElementBlocks = text.split('<selected_element>').slice(1); // Remove first empty element
	
	if (selectedElementBlocks.length === 0) {
		// No <selected_element> tags, try to parse as single block
		return parseSingleElement(text);
	}

	// Parse each selected element block
	const allComponents: ComponentInfo[] = [];
	for (const block of selectedElementBlocks) {
		const componentInfo = parseSingleElement(block);
		if (componentInfo && componentInfo.length > 0) {
			allComponents.push(componentInfo[0]);
		}
	}

	return allComponents.length > 0 ? allComponents : null;
}

function parseSingleElement(text: string): ComponentInfo[] | null {
	const codeLocationMatch = text.match(/## Code Location:\s*\n([\s\S]*?)(?:\n##|$|<\/selected_element>)/);
	if (!codeLocationMatch) {
		return null;
	}

	const lines = codeLocationMatch[1].split('\n').map(l => l.trim()).filter(l => l.startsWith('at '));
	
	if (lines.length === 0) {
		return null;
	}

	// Find the first line that has a file path (contains ' in ')
	let firstLineWithPath: string | null = null;
	for (const line of lines) {
		if (line.includes(' in ')) {
			firstLineWithPath = line;
			break;
		}
	}

	if (!firstLineWithPath) {
		return null;
	}

	const [componentPart, urlPart] = firstLineWithPath.split(' in ');
	const elementName = componentPart.replace('at ', '').trim();
	const url = urlPart.trim();
	const filePath = stripUrlPrefix(url);

	// Extract component name from the file path
	const fileNameMatch = filePath.match(/([^/\\]+)\.(tsx?|jsx?)$/);
	if (!fileNameMatch) {
		return null;
	}
	
	const componentName = fileNameMatch[1];
	
	// Return the file path from the first line and the component name from the file
	return [{ componentName, filePath }];
}

export function isReactComponent(name: string): boolean {
	// Check if it's a common HTML tag, built-in component, or router component
	const htmlTags = [
		// Standard HTML tags
		'div', 'span', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
		'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot',
		'form', 'input', 'button', 'select', 'option', 'textarea', 'label',
		'img', 'video', 'audio', 'canvas', 'svg', 'path', 'g', 'circle', 'rect', 'line',
		'section', 'article', 'header', 'footer', 'nav', 'aside', 'main', 
		'figure', 'figcaption', 'details', 'summary', 'dialog',
		'iframe', 'embed', 'object', 'param', 'source', 'track',
		'pre', 'code', 'blockquote', 'hr', 'br',
		// React Router and other library components
		'LinkWithRef', 'Link', 'NavLink', 'Navigate', 'Outlet', 'Routes', 'Route',
		'RenderedRoute', 'Router', 'BrowserRouter', 'HashRouter', 'MemoryRouter',
		// Common fragments
		'Fragment', 'Suspense', 'StrictMode', 'Profiler'
	];
	
	const lowerName = name.toLowerCase();
	
	// Single lowercase letter is HTML element
	if (name.length === 1 && name === lowerName) {
		return false;
	}
	
	// Check against the list
	if (htmlTags.includes(name) || htmlTags.includes(lowerName)) {
		return false;
	}
	
	return true;
}

export function stripUrlPrefix(url: string): string {
	const match = url.match(/^\/\/[^\/]+\//);
	if (match) {
		return url.substring(match[0].length);
	}
	return url;
}

async function resolveFileUri(filePath: string): Promise<vscode.Uri | null> {
	const workspaces = vscode.workspace.workspaceFolders;
	if (!workspaces) {
		console.log('No workspace folders found');
		return null;
	}

	console.log(`Trying to resolve file: ${filePath}`);
	console.log(`Available workspaces: ${workspaces.map(w => w.uri.fsPath).join(', ')}`);

	// Normalize file path separators for Windows
	const normalizedPath = filePath.replace(/\//g, '\\');

	for (const workspace of workspaces) {
		// Strategy 1: Try direct path relative to workspace root
		let fullPath = vscode.Uri.joinPath(workspace.uri, filePath);
		console.log(`Trying direct path: ${fullPath.fsPath}`);
		try {
			await vscode.workspace.fs.stat(fullPath);
			console.log(`Found file at: ${fullPath.fsPath}`);
			return fullPath;
		} catch {
			// Not found, continue with other strategies
		}

		// Strategy 2: If path starts with 'src/', try relative to workspace root
		if (filePath.startsWith('src/')) {
			fullPath = vscode.Uri.joinPath(workspace.uri, filePath);
			console.log(`Trying src/ relative to workspace root: ${fullPath.fsPath}`);
			try {
				await vscode.workspace.fs.stat(fullPath);
				console.log(`Found file at: ${fullPath.fsPath}`);
				return fullPath;
			} catch {
				// Not found, continue
			}
		}

		// Strategy 3: Search for file by name in the workspace
		const fileName = filePath.split('/').pop();
		if (fileName) {
			console.log(`Searching for file by name: ${fileName}`);
			const files = await vscode.workspace.findFiles(`**/${fileName}`, '**/node_modules/**', 10);
			console.log(`Found ${files.length} file(s) matching name: ${fileName}`);
			
			// Try to find the best match based on path segments
			const pathSegments = filePath.split('/').filter(s => s.length > 0);
			let bestMatch: vscode.Uri | null = null;
			let maxMatchScore = 0;

			for (const fileUri of files) {
				const filePathSegments = fileUri.fsPath.split('\\');
				let matchScore = 0;
				
				// Calculate match score based on matching path segments
				for (let i = pathSegments.length - 1, j = filePathSegments.length - 1; i >= 0 && j >= 0; i--, j--) {
					if (pathSegments[i] === filePathSegments[j]) {
						matchScore++;
					} else {
						break;
					}
				}

				console.log(`File ${fileUri.fsPath} has match score: ${matchScore}`);
				if (matchScore > maxMatchScore) {
					maxMatchScore = matchScore;
					bestMatch = fileUri;
				}
			}

			if (bestMatch && maxMatchScore > 0) {
				console.log(`Found best match with score ${maxMatchScore}: ${bestMatch.fsPath}`);
				return bestMatch;
			}
		}
	}

	console.log(`File not found in any workspace: ${filePath}`);
	return null;
}

async function navigateToComponent(editor: vscode.TextEditor, componentName: string): Promise<void> {
	const document = editor.document;
	const text = document.getText();

	console.log(`Searching for component "${componentName}" in file: ${document.fileName}`);

	// Search for component definition patterns
	const patterns = [
		new RegExp(`(?:export\\s+)?(?:function|const|class)\\s+${componentName}\\b`, 'g'),
		new RegExp(`(?:export\\s+)?${componentName}\\s*=`, 'g'),
	];

	for (const pattern of patterns) {
		console.log(`Trying pattern: ${pattern.source}`);
		let match;
		let found = false;
		while ((match = pattern.exec(text)) !== null) {
			const position = document.positionAt(match.index);
			const line = document.lineAt(position.line);
			console.log(`Found match at line ${position.line + 1}: ${line.text.trim()}`);
			const range = new vscode.Range(position, position);
			editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
			editor.selection = new vscode.Selection(position, position);
			found = true;
			break; // Take first match
		}
		if (found) {
			return;
		}
	}

	// If not found, show error but keep file open
	console.log(`Component "${componentName}" definition not found in file.`);
	vscode.window.showErrorMessage(`Component "${componentName}" definition not found in file.`);
}

// This method is called when your extension is deactivated
export function deactivate() {}
