# Publishing Instructions

## Before Publishing

1. **Update package.json**:
   - Set `publisher` field to your VS Code Marketplace publisher name
   - Update `author.name` with your name
   - Update repository URLs to your GitHub repo

2. **Create Publisher Account** (if you don't have one):
   - Go to https://marketplace.visualstudio.com/manage
   - Sign in with Microsoft/GitHub account
   - Create a publisher

3. **Install vsce** (VS Code Extension Manager):
   ```bash
   npm install -g @vscode/vsce
   ```

4. **Get Personal Access Token**:
   - Go to https://dev.azure.com/
   - Click on User Settings → Personal Access Tokens
   - Create new token with **Marketplace (Manage)** scope
   - Save the token securely

## Build and Package

1. **Compile the extension**:
   ```bash
   npm run compile
   ```

2. **Create package** (.vsix file):
   ```bash
   vsce package
   ```
   This creates `react-grab-opener-0.1.0.vsix`

3. **Test the package locally**:
   - In VS Code: Extensions → ... → Install from VSIX
   - Select the .vsix file
   - Test all functionality

## Publish to Marketplace

1. **Login to vsce**:
   ```bash
   vsce login <your-publisher-name>
   ```
   Enter your Personal Access Token when prompted

2. **Publish**:
   ```bash
   vsce publish
   ```

   Or publish the .vsix file manually:
   - Go to https://marketplace.visualstudio.com/manage
   - Click your publisher → New Extension → Visual Studio Code
   - Upload the .vsix file

## After Publishing

1. **Tag the release in git**:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **Create GitHub Release**:
   - Go to your repo → Releases → Create new release
   - Tag: v0.1.0
   - Title: Release 0.1.0
   - Description: Copy from CHANGELOG.md
   - Attach the .vsix file

## Updating

To publish an update:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Run `vsce publish patch|minor|major`
   - `patch`: 0.1.0 → 0.1.1
   - `minor`: 0.1.0 → 0.2.0
   - `major`: 0.1.0 → 1.0.0

## Additional Resources

- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Marketplace Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
