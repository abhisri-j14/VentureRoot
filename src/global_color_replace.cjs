const fs = require('fs');
const path = require('path');

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
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\app\\(marketing)\\page.tsx",
  "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\features\\reports\\components\\ReportDetailView.tsx"
];

for (const file of filesToUpdate) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // First, if there's bg-[#1E6702] and text-white, replace text-white with text-[#141411]
    // Because we are changing the background to mustard, so text should be black.
    // It's hard to do this with regex without full AST parsing, so let's just globally replace '#1E6702' with '#ad930e'.
    content = content.replace(/#1E6702/gi, '#ad930e');
    
    // For primary buttons and banners that use bg-[#ad930e] text-white, let's fix text-white to text-[#141411]
    // This regex looks for className strings containing bg-[#ad930e] and text-white
    content = content.replace(/className=(["`])([^"`]*?)bg-\[#ad930e\]([^"`]*?)text-white([^"`]*?)\1/g, 'className=$1$2bg-[#ad930e]$3text-[#141411]$4$1');
    content = content.replace(/className=(["`])([^"`]*?)text-white([^"`]*?)bg-\[#ad930e\]([^"`]*?)\1/g, 'className=$1$2text-[#141411]$3bg-[#ad930e]$4$1');

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}

// Special fixes for ReportDetailView.tsx
const reportViewPath = "c:\\Users\\User\\OneDrive\\Desktop\\VentureRoot\\frontend\\src\\features\\reports\\components\\ReportDetailView.tsx";
if (fs.existsSync(reportViewPath)) {
  let content = fs.readFileSync(reportViewPath, 'utf8');
  
  // Fix the Primary Risk and Verdict & Evidence backgrounds that became bg-[#81cc87] accidentally
  content = content.replace(
    /<div className="bg-\[#81cc87\] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-center border border-gray-800">/,
    '<div className="bg-[#ad930e] rounded-2xl p-6 text-[#141411] shadow-md relative overflow-hidden flex flex-col justify-center border border-gray-800">'
  );
  content = content.replace(
    /<div className="bg-\[#81cc87\] text-\[#f9faeb\] rounded-2xl p-6 shadow-md flex-1 flex flex-col justify-center border border-gray-800">/,
    '<div className="bg-[#ad930e] text-[#141411] rounded-2xl p-6 shadow-md flex-1 flex flex-col justify-center border border-gray-800">'
  );
  
  fs.writeFileSync(reportViewPath, content);
  console.log(`Applied specific fixes to ReportDetailView.tsx`);
}
