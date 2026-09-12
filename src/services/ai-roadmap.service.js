/**
 * VentureRoot AI Roadmap & Competitor Intelligence Service
 * ========================================================
 * Synthesizes business details, location demographics, and local competitor
 * landscape with Gemini 2.5 Flash to generate deeply tailored 12-month execution
 * roadmaps, sector-specific action items, and actionable competitor differentiation.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Main export: Generate tailored roadmap, action items, and competitor intelligence
 */
export async function generateTailoredRoadmapAndCompetitors({
  business,
  competitors = [],
  finance = null,
}) {
  const name = business?.name || "Target Enterprise";
  const category = business?.category?.name || business?.category || "Food Processing";
  const loc = business?.location || {};
  const district = loc.district || "District";
  const state = loc.state || "State";
  const subdistrict = loc.subdistrict || loc.block || district;
  const margin = Number(business?.availableMargin || 250000);
  const projectCost = Number(business?.projectCost || margin * 8);
  const workingCapital = Number(business?.workingCapitalRequirement || Math.round(projectCost * 0.15));
  const landType = business?.landType || "Owned / Commercial Premises";
  const targetScale = business?.targetScale || "Commercial Scale";
  const salesChannel = business?.salesChannel || "Direct & Wholesale Distribution";
  const facilityType = business?.facilityType || "";
  const bedCapacity = business?.bedCapacity || "";
  const medicalSpecialties = business?.medicalSpecialties || "";

  // Attempt live Gemini synthesis
  if (GEMINI_API_KEY) {
    try {
      const geminiResult = await callGeminiRoadmap({
        name,
        category,
        district,
        state,
        subdistrict,
        margin,
        projectCost,
        workingCapital,
        landType,
        targetScale,
        salesChannel,
        facilityType,
        bedCapacity,
        medicalSpecialties,
        competitors,
        finance,
      });

      if (geminiResult && geminiResult.phases && geminiResult.phases.length === 5) {
        return {
          source: "gemini-2.5-flash",
          roadmap: geminiResult,
          actionItems: geminiResult.actionItems || buildFallbackActionItems(business, geminiResult),
          competitorInsights: geminiResult.competitorInsights || buildFallbackCompetitorInsights(category, district, competitors),
        };
      }
    } catch (err) {
      console.warn("[ai-roadmap.service] Gemini live call failed or timed out, using sector fallback:", err.message);
    }
  }

  // Domain-engineered sector fallback
  const fallbackRoadmap = buildSectorSpecificRoadmap({
    name,
    category,
    district,
    state,
    subdistrict,
    margin,
    projectCost,
    workingCapital,
    landType,
    targetScale,
    salesChannel,
    facilityType,
    bedCapacity,
    medicalSpecialties,
    finance,
  });

  const fallbackActionItems = buildFallbackActionItems(business, fallbackRoadmap);
  const fallbackCompetitorInsights = buildFallbackCompetitorInsights(category, district, competitors);

  return {
    source: "domain-engineered-sector-fallback",
    roadmap: fallbackRoadmap,
    actionItems: fallbackActionItems,
    competitorInsights: fallbackCompetitorInsights,
  };
}

/**
 * Call Gemini 2.5 Flash API directly
 */
async function callGeminiRoadmap(context) {
  const isHealthcare =
    context.category.toLowerCase().includes("health") ||
    context.category.toLowerCase().includes("hospital") ||
    context.category.toLowerCase().includes("clinic");

  const prompt = `You are the Lead Micro-Enterprise & Infrastructure Advisor for VentureRoot (Ministry of MSME & Rural Development Advisor).
Generate an authoritative, hyper-realistic, 12-Month 5-Phase Execution Roadmap and Strategic Competitor Analysis for this specific business:

BUSINESS PROFILE:
- Business Name: ${context.name}
- Sector / Category: ${context.category}
- Specific Facility / Model: ${context.facilityType || context.category}
- Location: ${context.subdistrict}, ${context.district}, ${context.state}
- Total Project Cost (Capex): ₹${context.projectCost.toLocaleString("en-IN")}
- Promoter Margin Contribution: ₹${context.margin.toLocaleString("en-IN")}
- Working Capital Requirement: ₹${context.workingCapital.toLocaleString("en-IN")}
- Target Operational Scale: ${context.targetScale}
- Land / Premises Type: ${context.landType}
- Target Sales / Patient Channel: ${context.salesChannel}
${isHealthcare ? `- Bed Capacity: ${context.bedCapacity || "15-20 Beds"}\n- Medical Specialties: ${context.medicalSpecialties || "General Medicine, Obstetrics, Pediatrics, Emergency OT, Pharmacy"}` : ""}
- Nearby Local Competitors: ${context.competitors.map((c) => c.title || c.name || "Local Unit").slice(0, 4).join("; ") || "Incumbent local operators"}

INSTRUCTIONS:
1. The 12-month roadmap MUST be deeply tailored to ${context.category}. ${isHealthcare ? "For this hospital/healthcare venture, you MUST focus on clinical registrations (Clinical Establishments Act, Pollution Control Bio-Medical Waste Authorization, AERB for X-Ray, Pharmacy Council License, Fire NOC, NABH Entry Level), OT equipment, hospital beds, oxygen pipeline, doctor/nurse staffing, 24x7 emergency, Ayushman Bharat PM-JAY empanelment, and OPD/IPD breakeven." : "Include the exact statutory licenses, machinery, raw materials, quality standards, and market rollout for this specific sector."}
2. All financial figures must strictly match the ₹${context.projectCost.toLocaleString("en-IN")} capex and ₹${context.margin.toLocaleString("en-IN")} margin.
3. Competitor insights must realistically analyze how to differentiate and capture market share in ${context.district}.

Respond with ONLY a raw JSON object matching this structure (no markdown fences, no explanatory text):
{
  "phases": [
    {
      "phase": "Months 1–2",
      "title": "Phase title",
      "badge": "Foundation & Licensing",
      "summary": "2-3 sentences summary of Phase 1",
      "actions": [
        "Action 1 mentioning statutory authorities",
        "Action 2 mentioning bank DPR and credit linkage",
        "Action 3 premises and site clearance",
        "Action 4 foundational setup"
      ],
      "financialTarget": "Exact rupee deployment milestone",
      "riskMitigation": "Specific sector risk and exact operational mitigation",
      "milestoneKpi": "Measurable completion KPI"
    },
    {
      "phase": "Months 3–4",
      "title": "Phase title",
      "badge": "Infrastructure & Setup",
      "summary": "Phase 2 summary",
      "actions": ["Action 1", "Action 2", "Action 3", "Action 4"],
      "financialTarget": "Capex drawdown milestone",
      "riskMitigation": "Risk and mitigation",
      "milestoneKpi": "Equipment/facility milestone"
    },
    {
      "phase": "Months 5–6",
      "title": "Phase title",
      "badge": "Staffing & Quality Validation",
      "summary": "Phase 3 summary",
      "actions": ["Action 1", "Action 2", "Action 3", "Action 4"],
      "financialTarget": "Working capital drawdown",
      "riskMitigation": "Operational risk and mitigation",
      "milestoneKpi": "Dry-run / pilot test milestone"
    },
    {
      "phase": "Months 7–9",
      "title": "Phase title",
      "badge": "Go-To-Market & Revenue",
      "summary": "Phase 4 summary",
      "actions": ["Action 1", "Action 2", "Action 3", "Action 4"],
      "financialTarget": "Monthly turnover target and bank EMI repayment",
      "riskMitigation": "Market adoption risk and mitigation",
      "milestoneKpi": "Commercial target milestone"
    },
    {
      "phase": "Months 10–12",
      "title": "Phase title",
      "badge": "Scale & Breakeven",
      "summary": "Phase 5 summary",
      "actions": ["Action 1", "Action 2", "Action 3", "Action 4"],
      "financialTarget": "Net profit / cashflow milestone and subsidy audit",
      "riskMitigation": "Scaling risk and mitigation",
      "milestoneKpi": "Break-even and expansion KPI"
    }
  ],
  "actionItems": [
    {
      "id": "act-1",
      "order": 1,
      "title": "Short title",
      "description": "Short description",
      "whatToDo": "Detailed step",
      "expectedOutcome": "Concrete deliverable",
      "timeframe": "Weeks 1-3",
      "priority": "HIGH",
      "category": "COMPLIANCE",
      "status": "COMPLETED"
    },
    {
      "id": "act-2",
      "order": 2,
      "title": "Short title",
      "description": "Short description",
      "whatToDo": "Detailed step",
      "expectedOutcome": "Concrete deliverable",
      "timeframe": "Weeks 3-6",
      "priority": "HIGH",
      "category": "FINANCE",
      "status": "IN_PROGRESS"
    },
    {
      "id": "act-3",
      "order": 3,
      "title": "Short title",
      "description": "Short description",
      "whatToDo": "Detailed step",
      "expectedOutcome": "Concrete deliverable",
      "timeframe": "Months 2-3",
      "priority": "HIGH",
      "category": "OPERATIONS",
      "status": "NOT_STARTED"
    },
    {
      "id": "act-4",
      "order": 4,
      "title": "Short title",
      "description": "Short description",
      "whatToDo": "Detailed step",
      "expectedOutcome": "Concrete deliverable",
      "timeframe": "Months 3-4",
      "priority": "MEDIUM",
      "category": "OPERATIONS",
      "status": "NOT_STARTED"
    },
    {
      "id": "act-5",
      "order": 5,
      "title": "Short title",
      "description": "Short description",
      "whatToDo": "Detailed step",
      "expectedOutcome": "Concrete deliverable",
      "timeframe": "Months 4-5",
      "priority": "HIGH",
      "category": "COMPLIANCE",
      "status": "NOT_STARTED"
    },
    {
      "id": "act-6",
      "order": 6,
      "title": "Short title",
      "description": "Short description",
      "whatToDo": "Detailed step",
      "expectedOutcome": "Concrete deliverable",
      "timeframe": "Months 6-7",
      "priority": "HIGH",
      "category": "MARKET",
      "status": "NOT_STARTED"
    },
    {
      "id": "act-7",
      "order": 7,
      "title": "Short title",
      "description": "Short description",
      "whatToDo": "Detailed step",
      "expectedOutcome": "Concrete deliverable",
      "timeframe": "Months 8-10",
      "priority": "MEDIUM",
      "category": "MARKETING",
      "status": "NOT_STARTED"
    },
    {
      "id": "act-8",
      "order": 8,
      "title": "Short title",
      "description": "Short description",
      "whatToDo": "Detailed step",
      "expectedOutcome": "Concrete deliverable",
      "timeframe": "Months 10-12",
      "priority": "HIGH",
      "category": "FINANCE",
      "status": "NOT_STARTED"
    }
  ],
  "competitorInsights": {
    "marketGap": "Paragraph detailing the unmet demand in this district",
    "differentiationStrategy": [
      "Concrete strategic differentiator 1",
      "Concrete strategic differentiator 2",
      "Concrete strategic differentiator 3",
      "Concrete strategic differentiator 4"
    ],
    "pricingTactics": "Recommended pricing structure against competitors",
    "highMarginAddons": "2-3 high-margin specialized service offerings"
  }
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API responded with status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty response from Gemini API");

  return JSON.parse(rawText);
}

/**
 * Domain-engineered sector-specific roadmaps
 */
function buildSectorSpecificRoadmap(ctx) {
  const cat = (ctx.category || "").toLowerCase();
  const isHospital = cat.includes("health") || cat.includes("hospital") || cat.includes("clinic");
  const isDairy = cat.includes("dairy") || cat.includes("milk");
  const isRetail = cat.includes("retail") || cat.includes("kirana");
  const isPoultry = cat.includes("poultry") || cat.includes("bird") || cat.includes("egg");
  const isColdStorage = cat.includes("cold") || cat.includes("warehous") || cat.includes("storage");
  const isTextiles = cat.includes("textile") || cat.includes("garment") || cat.includes("apparel");
  const isHospitality = cat.includes("hospitality") || cat.includes("hotel") || cat.includes("restaurant");
  const isManufacturing = cat.includes("manufactur") || cat.includes("fabricat") || cat.includes("engineering");

  if (isHospital) {
    return {
      phases: [
        {
          phase: "Months 1–2",
          title: "Clinical Establishments Registration, Bio-Medical Waste NOC & Bank DPR",
          badge: "Foundation & Statutory Clearances",
          summary: `Formally establish the healthcare enterprise, apply for Clinical Establishments Act registration in ${ctx.district}, execute Pollution Control Board Bio-Medical Waste agreements, and secure bank loan sanction.`,
          actions: [
            `Submit Clinical Establishments Act application to ${ctx.district} Chief District Medical Officer (CDMO) with premises layout and doctor credentials.`,
            `Execute formal Bio-Medical Waste (BMW) management agreement with state SPCB-authorized common treatment facility vendor.`,
            `Obtain Fire Safety NOC from local fire authority and Gram Panchayat / Municipal commercial health establishment trade permit for ${ctx.landType}.`,
            `Engage a medical project consultant and chartered accountant to submit Detailed Project Report (DPR) for ₹${ctx.projectCost.toLocaleString("en-IN")} term loan sanction.`
          ],
          financialTarget: `Deploy ₹${ctx.margin.toLocaleString("en-IN")} promoter equity into escrow account. Obtain in-principle bank term loan sanction for ₹${Math.max(0, ctx.projectCost - ctx.margin).toLocaleString("en-IN")}.`,
          riskMitigation: "Statutory inspection delays: Pre-audit the facility layout against National Building Code (NBC) and SPCB clinical disposal norms before CDMO inspection.",
          milestoneKpi: "Provisional Clinical Establishment Registration Certificate issued within 45 days."
        },
        {
          phase: "Months 3–4",
          title: "OT & Ward Infrastructure, Medical Gas Pipeline & Equipment Procurement",
          badge: "Clinical Infrastructure & Technology",
          summary: `Execute hospital civil interior partitioning, erect modular Minor Operation Theatre, install centralized oxygen / vacuum pipelines, and procure verified diagnostic & monitoring equipment.`,
          actions: [
            `Procure ICU/semi-fowler hospital beds, multipara patient monitors, anesthesia workstation, and autoclave sterilization units from certified medical OEMs.`,
            `Install centralized medical gas pipeline system (MGPS) with automated manifold backup and emergency oxygen cylinder bank.`,
            `Energize 25 HP commercial 3-phase industrial power connection with dedicated auto-start silent Diesel Generator (DG) set for 100% ICU/OT uptime.`,
            `Disburse First Tranche of Bank Term Loan directly to medical equipment vendors against verified proforma invoices.`
          ],
          financialTarget: `Disburse 60% of capital expenditure (approx. ₹${Math.round(ctx.projectCost * 0.6).toLocaleString("en-IN")}) directly to medical equipment and civil infrastructure vendors.`,
          riskMitigation: "Equipment delivery and calibration delays: Contract OEMs with mandatory on-site testing, calibration certificate, and 24-month comprehensive AMC.",
          milestoneKpi: `${ctx.bedCapacity || "15-20"} inpatient beds, sterile Minor OT, and emergency triage unit fully erected and dry-tested.`
        },
        {
          phase: "Months 5–6",
          title: "Medical Staffing, State Pharmacy License & Diagnostic Lab Commissioning",
          badge: "Staffing & Quality Protocols",
          summary: `Recruit Resident Medical Officers (RMOs), GNM nursing staff, and OT technicians; obtain State Pharmacy Council retail drug license; and commission the in-house diagnostic laboratory.`,
          actions: [
            `Recruit 2 full-time Resident Medical Officers (MBBS/BAMS), 6 registered GNM staff nurses, and 2 certified lab technicians for round-the-clock shift rotations.`,
            `Obtain 24x7 Retail Drug / Pharmacy License (Form 20/21) from State Food & Drug Administration (FDA) with a registered pharmacist.`,
            `Commission in-house basic diagnostic laboratory (fully automated biochemistry, hematology CBC analyzer, and urine analyzer) with NABL calibration.`,
            `Establish standard operating clinical protocols (ICU admission, infection control, crash cart checklist, biomedical segregation).`
          ],
          financialTarget: `Draw working capital line of ₹${ctx.workingCapital.toLocaleString("en-IN")} to procure essential emergency pharmaceuticals, surgical consumables, and initial 60-day staff salaries.`,
          riskMitigation: "Nursing and doctor attrition: Offer structured performance incentives on night-call duties and provide on-campus furnished accommodation.",
          milestoneKpi: "Pharmacy license secured, 100% clinical staff onboarded, and successful clinical dry-run drill completed."
        },
        {
          phase: "Months 7–9",
          title: "Public Launch, Ayushman Bharat (PM-JAY) Empanelment & OPD Rollout",
          badge: "Go-To-Market & Revenue Ramp",
          summary: `Inaugurate 24x7 emergency and daily outpatient department (OPD), launch health screening camps across ${ctx.district}, initiate Ayushman Bharat PM-JAY empanelment, and commence monthly bank EMI repayments.`,
          actions: [
            `Launch daily morning and evening OPD consultations across General Medicine, Pediatrics, and Gynecology with ₹200–₹300 transparent consultation fees.`,
            `Submit online empanelment dossier under Ayushman Bharat (PM-JAY) and State Health Insurance Schemes to capture cashless rural beneficiaries.`,
            `Organize bi-weekly rural preventive health checkup camps in surrounding villages in collaboration with local Gram Panchayats and ASHA workers.`,
            `Commence monthly bank EMI payments directly from operating revenues generated by pharmacy sales, OPD, and daycare admissions.`
          ],
          financialTarget: `Achieve daily average of 35-50 OPD consultations and 5-8 bed admissions. Generate monthly gross turnover exceeding ₹${Math.round(ctx.projectCost * 0.12).toLocaleString("en-IN")}.`,
          riskMitigation: "Slow initial patient footfall: Partner with local general physicians, community leaders, and rural cooperative societies for transparent referral linkages.",
          milestoneKpi: "Active patient footfall reaching 40+ patients/day with positive operational cashflow sustained over 90 days."
        },
        {
          phase: "Months 10–12",
          title: "Inpatient Scaling (70% Occupancy), NABH Entry-Level Audit & Breakeven",
          badge: "Scale & Institutional Breakeven",
          summary: `Scale inpatient bed occupancy to sustainable breakeven threshold, complete National Accreditation Board for Hospitals (NABH) Entry-Level audit, and release government subsidy margin money.`,
          actions: [
            `Scale inpatient bed occupancy smoothly to 70–80% through routine minor surgical procedures, maternity deliveries, and medical stabilization.`,
            `Undergo formal assessment audit for NABH Entry-Level Hospital Certification, unlocking higher insurance reimbursement rates.`,
            `Submit DIC subsidy completion dossier and physical verification report to release PMEGP/MUDRA capital subsidy into Term Deposit Receipt (TDR).`,
            `Reinvest operational surplus into advanced diagnostic ultrasound and specialized visiting specialist OPD clinics.`
          ],
          financialTarget: `Achieve full operating breakeven with monthly gross billing exceeding ₹${Math.round(ctx.projectCost * 0.20).toLocaleString("en-IN")} and debt-service coverage ratio (DSCR) exceeding 1.75x.`,
          riskMitigation: "Insurance claim reimbursement delays: Implement dedicated TPA claims coordinator to ensure zero-deficiency claim submission within 48 hours of discharge.",
          milestoneKpi: "NABH Entry-Level accreditation awarded, 75% bed occupancy sustained, and net operating profitability achieved."
        }
      ]
    };
  }

  // General Enterprise / Food Processing / Dairy / Agro Default
  return {
    phases: [
      {
        phase: "Months 1–2",
        title: "Statutory Clearances, DPR Architecture & PMEGP Credit Linkage",
        badge: "Foundation & Clearances",
        summary: `Establish the enterprise legal entity, secure Udyam MSME registration, finalize bank Detailed Project Report (DPR) tailored to ${ctx.district}, and obtain provisional trade clearances.`,
        actions: [
          `Complete Udyam MSME registration and secure Gram Panchayat commercial trade permit for ${ctx.landType}.`,
          `Engage certified CA to formulate bank DPR with 5-year projected debt-service coverage ratio (DSCR > 1.6x).`,
          `Submit credit subsidy application under PMEGP on KVIC e-portal to claim 25%–35% rural margin money grant.`,
          `Submit loan dossier to PSU/Rural Bank branch in ${ctx.district} for formal term loan in-principle sanction.`
        ],
        financialTarget: `Deposit ₹${ctx.margin.toLocaleString("en-IN")} promoter equity into escrow account. Obtain bank loan sanction for balance ₹${Math.max(0, ctx.projectCost - ctx.margin).toLocaleString("en-IN")}.`,
        riskMitigation: "Bank appraisal delay: Pre-verify collateral title documents and submit clear NOC from District Industries Center (DIC).",
        milestoneKpi: "Bank In-Principle Loan Sanction Letter issued within 45 days."
      },
      {
        phase: "Months 3–4",
        title: "Equipment Procurement, 3-Phase Power Utilities & Facility Setup",
        badge: "Infrastructure Phase",
        summary: `Procure certified machinery from verified OEMs, install commercial 3-phase power load, and execute civil floor layout compliant with hygiene and pollution guidelines.`,
        actions: [
          `Issue Purchase Orders (PO) to shortlisted equipment OEMs with mandatory 12-month onsite warranty and commissioning terms.`,
          `Energize 15–25 HP commercial 3-phase power connection with state electricity distribution company (DISCOM).`,
          `Execute civil flooring, water storage, drainage, and waste management infrastructure compliant with SPCB white/green norms.`,
          `Draw down First Tranche of Bank Term Loan directly to machinery suppliers against Delivery Challans.`
        ],
        financialTarget: `Disburse 60% of capital expenditure (approx. ₹${Math.round(ctx.projectCost * 0.6).toLocaleString("en-IN")}) to equipment suppliers.`,
        riskMitigation: "Equipment delivery delay: Enforce a 10% performance hold-back payable only after successful onsite trial run.",
        milestoneKpi: "100% core processing machinery installed and dry-run tested on site."
      },
      {
        phase: "Months 5–6",
        title: "Raw Material Sourcing, Pilot Batch Run & Quality Certification",
        badge: "Validation & Standards",
        summary: `Contract local agrarian suppliers and FPOs in ${ctx.district}, run pilot production test batches at 30% capacity, and obtain mandatory quality certifications.`,
        actions: [
          `Sign bilateral supply contracts with 15–25 local farmer groups or suppliers in ${ctx.district} ensuring reliable input pricing.`,
          `Run controlled pilot production batches at 30% capacity (${ctx.targetScale}) to calibrate yield, wastage, and packaging integrity.`,
          `Send production samples to NABL-accredited laboratory for testing and obtain sector quality certification.`,
          `Finalize consumer packaging with barcode, batch coding, and regulatory labeling.`
        ],
        financialTarget: `Deploy ₹${ctx.workingCapital.toLocaleString("en-IN")} working capital to fund initial 30 days of raw material inventory and labor.`,
        riskMitigation: "Raw material quality inconsistency: Institute strict incoming batch testing protocols before accepting deliveries.",
        milestoneKpi: "Lab quality certification secured and zero-defect pilot production batch verified."
      },
      {
        phase: "Months 7–9",
        title: "Commercial Launch, Distribution Onboarding & Debt Servicing",
        badge: "Go-To-Market & Revenue",
        summary: `Officially roll out commercial operations across ${ctx.salesChannel}, onboard retail and wholesale partners, and commence monthly bank EMI payments from operating cashflow.`,
        actions: [
          `Execute commercial rollout across ${ctx.salesChannel} with structured 7-day rolling credit terms.`,
          `Onboard 30–50 retail partners in ${ctx.district} with point-of-sale branding and introductory trade margins.`,
          `Launch direct order fulfillment for institutional and bulk consumers in surrounding tehsils.`,
          `Scale production throughput smoothly from 40% to 70% of target capacity.`
        ],
        financialTarget: `Achieve monthly gross revenue exceeding ₹${Math.round(ctx.projectCost * 0.12).toLocaleString("en-IN")}. Commence monthly bank EMI payments on schedule.`,
        riskMitigation: "Retail payment collection delays: Offer a 1.5% instant cash discount for immediate UPI settlements upon delivery.",
        milestoneKpi: "30+ active re-ordering trade accounts and sustained operational gross margins."
      },
      {
        phase: "Months 10–12",
        title: "Scale to 85% Capacity, Breakeven Breached & Subsidy Release",
        badge: "Scale & Breakeven",
        summary: `Reach peak operational capacity, breach net breakeven, complete DIC physical verification audit, and release capital subsidy.`,
        actions: [
          `Operate plant at 80–85% target capacity with optimized shift planning and minimal waste.`,
          `Complete DIC physical verification inspection to credit PMEGP subsidy margin money into term deposit receipt (TDR).`,
          `Establish long-term supply agreements with semi-urban supermarkets and institutional buyers.`,
          `Build retained cash reserve equal to 3 months of operating expenses to fund future expansion.`
        ],
        financialTarget: `Achieve full operating breakeven with monthly gross revenue exceeding ₹${Math.round(ctx.projectCost * 0.18).toLocaleString("en-IN")}.`,
        riskMitigation: "Working capital stretch during harvest peak: Utilize bank cash credit (CC) limit rather than diverting operating profits.",
        milestoneKpi: "Breakeven achieved, capital subsidy released, and net positive profit sustained for 2 consecutive quarters."
      }
    ]
  };
}

/**
 * Build structured action items for RoadmapTimeline component
 */
function buildFallbackActionItems(biz, roadmap) {
  const cat = (biz?.category?.name || biz?.category || "").toLowerCase();
  const isHospital = cat.includes("health") || cat.includes("hospital") || cat.includes("clinic");
  const district = biz?.location?.district || "District";

  if (isHospital) {
    return [
      {
        id: "act-1",
        order: 1,
        title: "Clinical Establishments Act Registration",
        description: `File mandatory registration with ${district} District Health Authority / CDMO.`,
        whatToDo: `Submit detailed floor layout, bed count (15-20), medical gas safety plan, and RMO doctor registration certificates to the Chief District Medical Officer.`,
        expectedOutcome: "Provisional Clinical Establishment License authorizing inpatient and OPD care.",
        timeframe: "Weeks 1–4",
        priority: "HIGH",
        category: "COMPLIANCE",
        status: "COMPLETED",
      },
      {
        id: "act-2",
        order: 2,
        title: "Bio-Medical Waste Management Authorization",
        description: "Execute bilateral agreement with SPCB-authorized biomedical waste incinerator.",
        whatToDo: "Install color-coded segregation bins (Yellow, Red, Blue, White) in OT and wards, and execute collection contract with authorized regional disposal operator.",
        expectedOutcome: "State Pollution Control Board Bio-Medical Waste Authorization certificate.",
        timeframe: "Weeks 3–6",
        priority: "HIGH",
        category: "COMPLIANCE",
        status: "IN_PROGRESS",
      },
      {
        id: "act-3",
        order: 3,
        title: "Bank Term Loan & Working Capital Sanction",
        description: "Submit bank DPR for medical equipment financing under priority sector lending.",
        whatToDo: "Present 5-year cashflow projections, doctor credentials, and equipment proforma invoices to the PSU / rural commercial bank.",
        expectedOutcome: "Formal bank loan sanction letter covering OT setup, beds, and diagnostic equipment.",
        timeframe: "Weeks 4–8",
        priority: "HIGH",
        category: "FINANCE",
        status: "IN_PROGRESS",
      },
      {
        id: "act-4",
        order: 4,
        title: "Medical Gas Pipeline & Minor OT Installation",
        description: "Erect certified sterile Minor OT and centralized medical oxygen pipeline.",
        whatToDo: "Install manifold oxygen cylinder bank with automated changeover, HEPA-filtered OT ventilation, and multipara monitors.",
        expectedOutcome: "Fully functional and dry-run tested Minor OT and emergency resuscitation station.",
        timeframe: "Months 3–4",
        priority: "HIGH",
        category: "OPERATIONS",
        status: "NOT_STARTED",
      },
      {
        id: "act-5",
        order: 5,
        title: "24x7 Retail Pharmacy Drug License (Form 20/21)",
        description: "Obtain State FDA license for in-house emergency hospital pharmacy.",
        whatToDo: "Appoint registered pharmacist, inspect air-conditioned storage for vaccines/antibiotics, and file Form 20/21 on state FDA portal.",
        expectedOutcome: "Retail Drug License enabling 24x7 in-house prescription dispensing.",
        timeframe: "Months 4–5",
        priority: "HIGH",
        category: "COMPLIANCE",
        status: "NOT_STARTED",
      },
      {
        id: "act-6",
        order: 6,
        title: "Clinical Nursing & RMO Staff Onboarding",
        description: "Recruit 2 full-time MBBS/BAMS RMOs and 6 registered GNM nurses.",
        whatToDo: "Conduct clinical interviews, institute infection control standard operating procedures, and conduct emergency crash-cart mock drills.",
        expectedOutcome: "Complete 24x7 clinical duty roster operationalized across 3 shifts.",
        timeframe: "Months 5–6",
        priority: "HIGH",
        category: "OPERATIONS",
        status: "NOT_STARTED",
      },
      {
        id: "act-7",
        order: 7,
        title: "Ayushman Bharat (PM-JAY) Empanelment",
        description: "Apply on National Health Authority portal for cashless scheme empanelment.",
        whatToDo: "Submit hospital infrastructure photos, bed registration, and fee schedule to State Health Agency (SHA) for PM-JAY hospital empanelment.",
        expectedOutcome: "Empanelled hospital status enabling cashless patient admissions under PM-JAY.",
        timeframe: "Months 6–8",
        priority: "HIGH",
        category: "MARKET",
        status: "NOT_STARTED",
      },
      {
        id: "act-8",
        order: 8,
        title: "NABH Entry-Level Quality Accreditation",
        description: "Undergo formal assessment for NABH Entry-Level Hospital Certification.",
        whatToDo: "Implement documentation for patient rights, medication management, infection control, and continuous nursing training.",
        expectedOutcome: "NABH Entry-Level Accreditation certificate, unlocking higher insurance claim reimbursement.",
        timeframe: "Months 10–12",
        priority: "MEDIUM",
        category: "COMPLIANCE",
        status: "NOT_STARTED",
      },
    ];
  }

  // Generic enterprise action items
  return [
    {
      id: "act-1",
      order: 1,
      title: "Udyam Registration & Trade Permit",
      description: `Formalize enterprise legal structure and local trade permit in ${district}.`,
      whatToDo: "Register online on official Udyam portal and obtain Gram Panchayat commercial trade permit.",
      expectedOutcome: "Official Udyam Registration Certificate and local operating permit.",
      timeframe: "Weeks 1–2",
      priority: "HIGH",
      category: "COMPLIANCE",
      status: "COMPLETED",
    },
    {
      id: "act-2",
      order: 2,
      title: "Bank DPR Formulation & Credit Linkage",
      description: "Submit bankable DPR to PSU / Rural Bank under PMEGP scheme.",
      whatToDo: "Formulate 5-year cashflow model with DSCR > 1.6x and submit online application on KVIC portal.",
      expectedOutcome: "In-principle bank loan sanction letter covering machinery and civil capex.",
      timeframe: "Weeks 3–6",
      priority: "HIGH",
      category: "FINANCE",
      status: "IN_PROGRESS",
    },
    {
      id: "act-3",
      order: 3,
      title: "Machinery Procurement & Purchase Orders",
      description: "Issue purchase orders to certified OEMs with 12-month warranty.",
      whatToDo: "Finalize equipment specifications, negotiate commercial terms, and draw down first bank loan tranche.",
      expectedOutcome: "Purchase Orders executed with equipment delivery timelines locked.",
      timeframe: "Months 2–3",
      priority: "HIGH",
      category: "OPERATIONS",
      status: "NOT_STARTED",
    },
    {
      id: "act-4",
      order: 4,
      title: "3-Phase Power Utilities & Civil Setup",
      description: "Energize dedicated 3-phase industrial power load with DISCOM.",
      whatToDo: "Complete wiring, earthing, water connections, and civil shed preparation compliant with safety norms.",
      expectedOutcome: "Industrial electric meter energized and premises ready for machine installation.",
      timeframe: "Months 3–4",
      priority: "MEDIUM",
      category: "OPERATIONS",
      status: "NOT_STARTED",
    },
    {
      id: "act-5",
      order: 5,
      title: "Mandatory Sector Quality Certification",
      description: "Obtain statutory licenses (FSSAI / SPCB / Factory Inspection).",
      whatToDo: "Submit layout plan, testing reports, and premise NOCs on regulatory state portals.",
      expectedOutcome: "Official statutory operating license and quality compliance certification.",
      timeframe: "Months 4–5",
      priority: "HIGH",
      category: "COMPLIANCE",
      status: "NOT_STARTED",
    },
    {
      id: "act-6",
      order: 6,
      title: "Raw Material Supplier Contract Agreements",
      description: "Secure direct supply agreements with local producer groups and suppliers.",
      whatToDo: "Sign bilateral purchase contracts with 15–25 local suppliers ensuring input cost predictability.",
      expectedOutcome: "Steady incoming raw material supply guaranteed below retail open-market rates.",
      timeframe: "Months 5–6",
      priority: "HIGH",
      category: "SUPPLY",
      status: "NOT_STARTED",
    },
    {
      id: "act-7",
      order: 7,
      title: "Commercial Retail Rollout & Channel Onboarding",
      description: "Launch commercial sales across target district distribution networks.",
      whatToDo: "Onboard 30–50 retail partners with structured 7-day rolling credit and direct delivery routes.",
      expectedOutcome: "Active distribution pipeline and positive operating sales turnover achieved.",
      timeframe: "Months 7–9",
      priority: "HIGH",
      category: "MARKET",
      status: "NOT_STARTED",
    },
    {
      id: "act-8",
      order: 8,
      title: "Capacity Scale to 85% & Breakeven Audit",
      description: "Scale processing throughput to achieve sustained net operating profitability.",
      whatToDo: "Streamline shift operations, conduct DIC subsidy physical audit, and build 3-month operating reserve.",
      expectedOutcome: "Operating breakeven achieved and government subsidy margin money credited.",
      timeframe: "Months 10–12",
      priority: "HIGH",
      category: "FINANCE",
      status: "NOT_STARTED",
    },
  ];
}

/**
 * Build competitor insights and actionable business suggestions
 */
function buildFallbackCompetitorInsights(category, district, competitors = []) {
  const cat = (category || "").toLowerCase();
  const isHospital = cat.includes("health") || cat.includes("hospital") || cat.includes("clinic");

  if (isHospital) {
    return {
      marketGap: `In ${district}, primary healthcare is bifurcated between overcrowded public Community Health Centres (CHCs) with long wait times and expensive private nursing homes with opaque billing. There is a substantial unmet need for clean, affordable 15–20 bed community secondary care offering transparent package pricing, 24x7 emergency doctor coverage, and Ayushman Bharat cashless facility.`,
      differentiationStrategy: [
        "Transparent Fixed-Price Surgical Packages: Offer all-inclusive package rates for normal deliveries, cesarean sections, and minor general surgeries with zero hidden add-ons.",
        "24x7 Doctor & Emergency On-Site: Guarantee continuous MBBS/RMO physical presence on premises with an operational emergency resuscitation triage.",
        "Ayushman Bharat (PM-JAY) & Cashless TPA Tie-ups: Enable 100% cashless hospitalizations for rural BPL cardholders and insured salaried families.",
        "Integrated In-House Diagnostics & Pharmacy: Provide rapid 1-hour STAT blood panel reports and round-the-clock generic/branded medications at fair prices.",
      ],
      pricingTactics: `Benchmark general OPD consultation at ₹250–₹350 (competitive with local private clinics while offering superior sanitized waiting areas). Inpatient bed rates at ₹1,000–₹1,400/day for general ward and ₹2,200 for private rooms, priced 25% below district corporate hospitals.`,
      highMarginAddons: "Specialized weekend visiting consultant clinics (Cardiology, Orthopedics, Gynecology), in-house ultrasound diagnostic clinics, and preventive corporate health checkup packages.",
    };
  }

  return {
    marketGap: `In ${district}, incumbent competitors primarily operate on unorganized traditional models with inconsistent quality, manual packaging, and seasonal supply disruptions. Customers and retailers increasingly demand consistent, certified quality, branded hygienic packaging, and dependable doorstep delivery schedules.`,
    differentiationStrategy: [
      "Certified Hygiene & Purity Guarantee: Highlight formal quality certification and tamper-evident packaging to build consumer trust against unorganized loose commodities.",
      "Direct Producer Linkage: Bypassing APMC intermediaries by purchasing directly from local farmer producer organizations (FPOs) at competitive farmgate prices.",
      "Reliable 7-Day Rolling Credit for Retailers: Provide local retailers with predictable delivery schedules and flexible digital UPI invoicing.",
      "Hyper-Local Doorstep Delivery: Direct WhatsApp and phone ordering for bulk commercial buyers, institutions, and cooperative canteens.",
    ],
    pricingTactics: `Price premium branded retail packs at 5–8% above raw unorganized commodity prices to reflect superior hygiene, while maintaining wholesale bulk rates at parity with APMC clearing rates.`,
    highMarginAddons: "Value-added specialty processing variants, institutional catering packs, and private-label contract packaging for regional wholesalers.",
  };
}
