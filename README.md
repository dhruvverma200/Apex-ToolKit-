# ApexToolkit Pro

This project ZIP contains the latest uploaded ApexToolkit Pro TSX source plus a Vite, React, TypeScript, and Tailwind scaffold.

## Start on Windows

1. Extract the ZIP.
2. Open PowerShell in the extracted **project root** folder (the folder containing `package.json`, not `src`).
3. Run these commands:

   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```

4. Open the localhost URL printed by Vite (usually `http://localhost:5173/`).

Use `npm.cmd` in PowerShell if the `npm.ps1` execution-policy error appears.

## Production build

```powershell
npm.cmd run build
```

## Setup notes

- Main website source: `src/App.tsx`.
- Firebase credentials/config are not included in the uploaded TSX file. Firebase features may need environment configuration depending on the runtime expected by the app.
- AdSense is disabled by default in the supplied source. Replace placeholder publisher/slot IDs with real values only after account approval.
- This ZIP includes a project scaffold, not any separate assets or environment secrets that were not provided in the upload.
