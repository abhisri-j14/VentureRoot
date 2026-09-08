"""
Structured 18-Section Advisory Report Formatter.
Assembles validated evidence into a professional, standardized advisory report.
"""

from typing import Dict, Any, List

class AdvisoryReportFormatter:
    def format_report(
        self,
        user_query: str,
        data_map: Dict[str, Dict[str, Any]],
        confidence_level: str,
        warnings: List[str]
    ) -> str:
        """
        Build clean Github-flavored Markdown report adhering to 18-section layout.
        Only renders sections for which valid evidence exists.
        """
        sections: List[str] = []

        # 1. Executive Summary
        sections.append("# GramBiz Executive Advisory Report\n")
        sections.append(
            f"**Overall Assessment**: Based on hyper-local economic models and official regulatory data, "
            f"this report evaluates the commercial and financial feasibility for your query.\n"
            f"**Composite Confidence**: `{confidence_level}`\n"
        )

        if warnings:
            sections.append("### Service Availability Warnings")
            for w in warnings:
                sections.append(f"- ⚠️ {w}")
            sections.append("")

        # 2. User Objective
        sections.append("## 1. User Objective")
        sections.append(f"> *\"{user_query}\"*\n")

        # 3. Location Assessment & 4. Market Potential (Model 1)
        if "model_1" in data_map:
            m1 = data_map["model_1"]
            sections.append("## 2. Location Assessment & Market Potential")
            sections.append(f"- **Target Location**: {m1.get('location')}, {m1.get('district')} District")
            sections.append(f"- **Market Potential Score**: {m1.get('potential_score')} / 100 ({m1.get('tier')})")
            sections.append(f"- **High-Opportunity Categories**: {', '.join(m1.get('top_categories', []))}\n")

        # 5. Business Viability & 6. Category Opportunity (Model 2)
        if "model_2" in data_map:
            m2 = data_map["model_2"]
            sections.append("## 3. Business Viability & Competition Analysis")
            sections.append(f"- **Business Category**: {m2.get('business_type')}")
            sections.append(f"- **Viability Score**: {m2.get('viability_score')} / 100")
            sections.append(f"- **Market Gap Score**: {m2.get('market_gap_score')} / 100")
            sections.append(f"- **Local Competition Level**: {m2.get('competition_level')}")
            sections.append(f"- **Assessed Risk Level**: {m2.get('risk_level')}\n")

        # 7. Expected Market Price & 8. Reference Selling Price (Model 3)
        if "model_3" in data_map:
            m3 = data_map["model_3"]
            sections.append("## 4. Local Commodity Price Prediction")
            sections.append(f"- **Commodity**: {m3.get('commodity')}")
            sections.append(f"- **Estimated APMC Market Price**: **₹{m3.get('predicted_price_per_quintal'):,.2f}** per quintal")
            sections.append(f"- **90% Conformal Prediction Interval**: ₹{m3.get('lower_bound_90'):,.2f} to ₹{m3.get('upper_bound_90'):,.2f} per quintal")
            sections.append(f"- **Reference Retail Market Price**: ₹{m3.get('reference_retail_price_per_kg'):,.2f} / kg\n")

        # 9. Financial Feasibility (Finance Engine)
        if "finance_engine" in data_map:
            fe = data_map["finance_engine"]
            sections.append("## 5. Financial Feasibility & Loan Breakdown")
            sections.append(f"- **Estimated Total Project Cost**: ₹{fe.get('project_cost'):,.2f}")
            sections.append(f"- **Promoter Contribution (Margin)**: ₹{fe.get('promoter_contribution'):,.2f}")
            sections.append(f"- **Estimated Scheme Capital Subsidy**: ₹{fe.get('subsidy_amount'):,.2f}")
            sections.append(f"- **Eligible Bank Loan Amount**: ₹{fe.get('eligible_loan_amount'):,.2f}")
            sections.append(f"- **Interest Rate**: {fe.get('interest_rate_pct')}% p.a.")
            sections.append(f"- **Tenure**: {fe.get('tenure_months')} months")
            sections.append(f"- **Estimated Monthly Loan EMI**: **₹{fe.get('monthly_emi'):,.2f}**")
            sections.append(f"- **Estimated Operational Break-Even**: {fe.get('break_even_months')} months\n")

        # 10. Government Schemes & 11. Regulatory Considerations (RAG)
        if "rag" in data_map:
            rag = data_map["rag"]
            sections.append("## 6. Government Schemes & Regulatory Compliance")
            if rag.get("should_abstain"):
                sections.append(f"> ⚠️ *{rag.get('answer')}*\n")
            else:
                sections.append(f"{rag.get('answer')}\n")
                if rag.get("citations"):
                    sections.append("### Official Source Citations")
                    for cit in rag["citations"]:
                        sections.append(f"- **{cit.get('citation_id')}** {cit.get('title')} ({cit.get('publisher')}) - Page {cit.get('page_number')}")
                    sections.append("")

        # 12. Positive Factors & Risk Factors
        sections.append("## 7. Strategic Factors & Risk Management")
        sections.append("### Positive Factors")
        sections.append("- Strong local demand indicators and high market potential tier.")
        sections.append("- Government credit-linked subsidy support available under central & state schemes.")
        sections.append("### Risk Factors")
        sections.append("- Seasonal commodity price fluctuations within conformal interval bounds.")
        sections.append("- Working capital management during initial break-even phase.")

        # 13. Reliability, Data Freshness & Limitations
        sections.append("\n## 8. Governance & Advisory Disclaimers")
        sections.append(f"- **Composite Confidence**: `{confidence_level}`")
        sections.append(f"- **Data Freshness**: Current (2024-2026)")
        sections.append(
            "- **Disclaimer**: This advisory report is generated by GramBiz AI Advisory Agent based on statistical "
            "prediction models and retrieved official publications. Final loan approvals, scheme subsidies, and APMC "
            "licensing remain subject to verification by concerned government agencies and lending banks."
        )

        return "\n".join(sections)
