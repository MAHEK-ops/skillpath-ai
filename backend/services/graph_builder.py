"""
Graph Builder Service.
Constructs a Directed Acyclic Graph (DAG) of skill gaps with prerequisite edges.
Uses NetworkX for graph algorithms.
"""

import json
import logging
from pathlib import Path
from typing import List, Dict, Tuple, Any

import networkx as nx

from models.schemas import SkillGap, TraceEntry
from services.trace_logger import TraceLogger

logger = logging.getLogger(__name__)


PREREQUISITES_PATH = Path(__file__).parent.parent / "data" / "prerequisites.json"

_prerequisites_cache: Dict[str, List[str]] = {}


def _load_prerequisites() -> Dict[str, List[str]]:
    global _prerequisites_cache
    if not _prerequisites_cache:
        with open(PREREQUISITES_PATH, "r") as f:
            _prerequisites_cache = json.load(f)
    return _prerequisites_cache


def build_skill_gap_graph(
    skill_gaps: List[SkillGap],
    trace_logger: TraceLogger,
) -> Tuple[nx.DiGraph, Dict[str, Any]]:
    """
    Build a directed acyclic graph representing skill gaps and their prerequisites.

    Nodes = skills with gaps
    Edges = prerequisite relationships (A → B means "learn A before B")

    Returns:
        - graph: NetworkX DiGraph for topological sorting
        - graph_data: Serializable dict for frontend React Flow visualization
    """
    prerequisites = _load_prerequisites()
    gap_codes = {gap.skill_code for gap in skill_gaps}
    gap_map = {gap.skill_code: gap for gap in skill_gaps}

    G = nx.DiGraph()


    for gap in skill_gaps:
        G.add_node(
            gap.skill_code,
            skill_name=gap.skill_name,
            gap_score=gap.gap_score,
            priority_score=gap.priority_score,
            importance=gap.importance.value,
            candidate_level=gap.candidate_level,
            required_level=gap.required_level,
            category=gap.category or "General",
        )


    edges_added = 0
    for gap in skill_gaps:
        prereqs = prerequisites.get(gap.skill_code, [])
        for prereq_code in prereqs:
            if prereq_code in gap_codes:

                G.add_edge(prereq_code, gap.skill_code)
                edges_added += 1


    try:
        cycles = list(nx.simple_cycles(G))
        if cycles:
            logger.warning(f"Cycles detected in skill graph: {cycles}. Removing cycle edges.")
            for cycle in cycles:

                G.remove_edge(cycle[-1], cycle[0])
    except Exception as e:
        logger.error(f"Cycle detection failed: {e}")

    trace_logger.log(
        step="graph_construction",
        input_summary=f"{len(skill_gaps)} skill gaps",
        output_summary=f"DAG with {G.number_of_nodes()} nodes and {edges_added} prerequisite edges",
        reasoning=(
            f"Built a Directed Acyclic Graph for {len(skill_gaps)} skill gaps. "
            f"Added {edges_added} prerequisite edges from the prerequisite map. "
            f"Prerequisites ensure foundational skills are learned before advanced ones."
        ),
        metadata={"nodes": G.number_of_nodes(), "edges": edges_added},
    )


    graph_data = _build_frontend_graph_data(G, gap_map)
    return G, graph_data


def _build_frontend_graph_data(
    G: nx.DiGraph,
    gap_map: Dict[str, SkillGap],
) -> Dict[str, Any]:
    """Build nodes/edges structure compatible with React Flow."""
    nodes = []
    edges = []


    try:
        pos = nx.spring_layout(G, seed=42, k=2.0)
    except Exception:
        pos = {node: (i * 200, 0) for i, node in enumerate(G.nodes())}

    for i, (node_id, data) in enumerate(G.nodes(data=True)):
        gap = gap_map.get(node_id)
        x, y = pos.get(node_id, (0, 0))


        if data.get("gap_score", 0) >= 3:
            color = "#ef4444" 
        elif data.get("gap_score", 0) >= 1:
            color = "#f59e0b"  
        else:
            color = "#22c55e"  

        nodes.append({
            "id": node_id,
            "label": data.get("skill_name", node_id),
            "data": {
                "skill_name": data.get("skill_name", node_id),
                "gap_score": data.get("gap_score", 0),
                "priority_score": data.get("priority_score", 0),
                "importance": data.get("importance", "important"),
                "candidate_level": data.get("candidate_level", 0),
                "required_level": data.get("required_level", 1),
                "category": data.get("category", "General"),
                "color": color,
            },
            "position": {"x": float(x) * 300 + 400, "y": float(y) * 200 + 300},
            "type": "skillNode",
        })

    for i, (src, dst) in enumerate(G.edges()):
        edges.append({
            "id": f"e_{src}_{dst}",
            "source": src,
            "target": dst,
            "label": "prereq",
            "animated": True,
        })

    return {"nodes": nodes, "edges": edges}
