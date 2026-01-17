import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('parseClipboard should extract component info', () => {
		const testInput = `<selected_element>
## HTML Frame:
<a class="group card flex..." href="/category/accessorie..." data-discover="true">
  <span ...>
  <span ...>
  Accessories
</a>

## Code Location:
  at a
  at LinkWithRef in //localhost:5173/src/components/catalog/CatalogSection.tsx
  at div in //localhost:5173/src/components/catalog/CatalogSection.tsx
  at section in //localhost:5173/src/components/catalog/CatalogSection.tsx
</selected_element>`;

		const result = myExtension.parseClipboard(testInput);
		assert.ok(Array.isArray(result));
		assert.strictEqual(result.length, 1);
		assert.strictEqual(result[0].componentName, 'LinkWithRef');
		assert.strictEqual(result[0].filePath, 'src/components/catalog/CatalogSection.tsx');
	});

	test('parseClipboard should extract multiple components', () => {
		const testInput = `<selected_element>
## HTML Frame:
<span class="text-4xl transition-...">
  👕
</span>

## Code Location:
  at span in //localhost:5173/src/components/catalog/CatalogSection.tsx
  at a
  at LinkWithRef in //localhost:5173/src/components/catalog/CatalogSection.tsx
  at div in //localhost:5173/src/components/catalog/CatalogSection.tsx
  at section in //localhost:5173/src/components/catalog/CatalogSection.tsx
  at CatalogSection in //localhost:5173/src/pages/home/Home.tsx
  at div in //localhost:5173/src/pages/home/Home.tsx
  at Home in //localhost:5173/src/App.tsx
  at RenderedRoute
  at Outlet in //localhost:5173/src/components/layout/Layout.tsx
  at main in //localhost:5173/src/components/layout/Layout.tsx
  at div in //localhost:5173/src/components/layout/Layout.tsx
  at Layout in //localhost:5173/src/App.tsx
  at RenderedRoute
  at Routes in //localhost:5173/src/App.tsx
</selected_element>`;

		const result = myExtension.parseClipboard(testInput);
		assert.ok(Array.isArray(result));
		assert.strictEqual(result.length, 6);
		const componentNames = result.map(c => c.componentName);
		assert.ok(componentNames.includes('LinkWithRef'));
		assert.ok(componentNames.includes('CatalogSection'));
		assert.ok(componentNames.includes('Home'));
		assert.ok(componentNames.includes('Outlet'));
		assert.ok(componentNames.includes('Layout'));
		assert.ok(componentNames.includes('Routes'));
	});

	test('stripUrlPrefix should remove localhost prefix', () => {
		const result = (myExtension as any).stripUrlPrefix('//localhost:5173/src/components/test.tsx');
		assert.strictEqual(result, 'src/components/test.tsx');
	});

	test('isReactComponent should identify React components', () => {
		assert.ok((myExtension as any).isReactComponent('LinkWithRef'));
		assert.ok(!(myExtension as any).isReactComponent('div'));
		assert.ok(!(myExtension as any).isReactComponent('a'));
	});
});
