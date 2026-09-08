"""
GramBiz Gemini AI Advisory Agent Orchestrator.
Main entry point coordinating Intent Planning, Tool Execution, Numerical Integrity Firewall, and 18-Section Advisory Report Generation.
"""

import time
import uuid
from typing import Dict, Any, Optional

from .config import settings
from .schemas import AdvisoryRequest, AgentPlan, ToolExecutionResult
from .planner import IntentPlanner
from .tools import ToolRunner
from .safety.failure_isolation import ToolFailureIsolator
from .confidence.evaluator import CompositeConfidenceEvaluator
from .formatter.report_formatter import AdvisoryReportFormatter
from .safety.numerical_firewall import NumericalIntegrityFirewall
from .safety.injection_defense import AdvisorInjectionDefense

class GramBizAdvisorAgent:
    def __init__(self):
        self.planner = IntentPlanner()
        self.tool_runner = ToolRunner()
        self.isolator = ToolFailureIsolator()
        self.confidence_evaluator = CompositeConfidenceEvaluator()
        self.formatter = AdvisoryReportFormatter()
        self.firewall = NumericalIntegrityFirewall()
        self.defense = AdvisorInjectionDefense()

    def process_request(self, req: AdvisoryRequest) -> Dict[str, Any]:
        """
        Execute full advisory workflow: Plan -> Execute Tools -> Evaluate Confidence -> Format -> Firewall Check -> Return.
        """
        start_t = time.time()
        req_id = f"req_{uuid.uuid4().hex[:8]}"

        # 1. Sanitize user input
        sanitized_query = self.defense.sanitize_input(req.user_query)

        # 2. Intent Planning
        plan: AgentPlan = self.planner.plan(sanitized_query)

        # 3. Tool Execution
        tool_results = []
        
        for tool_name in plan.tools_required:
            if len(tool_results) >= settings.max_tool_calls:
                break
                
            if tool_name == "model_1":
                res = self.tool_runner.call_model_1(location=req.location, district=req.district)
                tool_results.append(res)
            elif tool_name == "model_2":
                b_type = req.proposed_business or "Micro-Enterprise"
                res = self.tool_runner.call_model_2(business_type=b_type, location=req.location)
                tool_results.append(res)
            elif tool_name == "model_3":
                comm = req.commodity or "Potato"
                res = self.tool_runner.call_model_3(commodity=comm, location=req.location)
                tool_results.append(res)
            elif tool_name == "finance_engine":
                cost = req.investment_amount or 500000.0
                margin = req.own_margin or 100000.0
                res = self.tool_runner.call_finance_engine(project_cost=cost, own_margin=margin)
                tool_results.append(res)
            elif tool_name == "rag":
                res = self.tool_runner.call_rag(query=sanitized_query)
                tool_results.append(res)

        # 4. Failure Isolation & Data Aggregation
        processed_data = self.isolator.process_tool_results(tool_results)
        data_map = processed_data["data_map"]
        warnings = processed_data["warnings"]

        # 5. Composite Confidence Assessment
        conf_level = self.confidence_evaluator.evaluate(data_map, plan.tools_required)

        # 6. Format Report
        draft_report = self.formatter.format_report(
            user_query=sanitized_query,
            data_map=data_map,
            confidence_level=conf_level,
            warnings=warnings
        )

        # 7. Numerical Integrity Firewall Check
        is_valid, num_violations, final_report = self.firewall.verify_numerical_integrity(draft_report, data_map)

        latency_ms = (time.time() - start_t) * 1000.0

        return {
            "request_id": req_id,
            "plan": plan.model_dump(),
            "confidence_level": conf_level,
            "warnings": warnings,
            "numerical_violations": num_violations,
            "advisory_report": final_report,
            "tool_results": [t.model_dump() for t in tool_results],
            "latency_ms": round(latency_ms, 2)
        }
