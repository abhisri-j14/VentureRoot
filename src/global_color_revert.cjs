const fs = require('fs');

const filesToUpdate = [
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\features\\profile\\components\\OnboardingFlow.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\features\\reports\\components\\ReportCard.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\features\\advisor\\components\\ChatWindow.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\components\\ui\\charts\\index.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\components\\layout\\DashboardBackground.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\components\\auth\\ProtectedRoute.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\app\\(auth)\\register\\page.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\app\\(dashboard)\\dashboard\\page.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\app\\(auth)\\login\\page.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\app\\(dashboard)\\advisor\\page.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\app\\(dashboard)\\business\\create\\page.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\app\\onboarding\\page.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\components\\ui\\quantum-cloud-loader.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\app\\(marketing)\\page.tsx"
];

for (const file of filesToUpdate) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/className=(["`])([^"`]*?)bg-\[#ad930e\]([^"`]*?)text-\[#141411\]([^"`]*?)\1/g, 'className=$1$2bg-[#ad930e]$3text-white$4$1');
    content = content.replace(/className=(["`])([^"`]*?)text-\[#141411\]([^"`]*?)bg-\[#ad930e\]([^"`]*?)\1/g, 'className=$1$2text-white$3bg-[#ad930e]$4$1');

    content = content.replace(/#ad930e/gi, '#1E6702');
    
    fs.writeFileSync(file, content);
    console.log(`Reverted ${file}`);
  }
}
