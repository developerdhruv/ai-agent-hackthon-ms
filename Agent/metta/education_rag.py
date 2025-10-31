from typing import List
from hyperon import MeTTa, E, S, ValueAtom


class EducationRAG:
    def __init__(self, metta: MeTTa):
        self.metta = metta

    def add_fact(self, relation: str, subject: str, obj: str):
        self.metta.space().add_atom(E(S(relation), S(subject.lower()), ValueAtom(obj)))

    def _query(self, relation: str, subject: str) -> List[str]:
        subject = subject.strip('"').lower()
        q = f'!(match &self ({relation} {subject} $x) $x)'
        result = self.metta.run(q)
        return [r[0].get_object().value for r in result if r and len(r) > 0]

    def subtopics_for(self, topic: str, level: str) -> List[str]:
        res = self._query("subtopic", topic)
        # add level-specific
        res += self._query("subtopic_" + level, topic)
        # unique preserve order
        seen = set()
        out = []
        for x in res:
            if x not in seen:
                seen.add(x)
                out.append(x)
        return out

    def resources_for(self, topic: str, level: str) -> List[str]:
        res = self._query("resource", topic)
        res += self._query("resource_" + level, topic)
        seen = set()
        out = []
        for x in res:
            if x not in seen:
                seen.add(x)
                out.append(x)
        return out


