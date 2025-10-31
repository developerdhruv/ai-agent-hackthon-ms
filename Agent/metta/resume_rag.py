from typing import List, Optional
from hyperon import MeTTa, E, S, ValueAtom


class ResumeRAG:
    def __init__(self, metta: MeTTa):
        self.metta = metta

    def add_fact(self, relation: str, subject: str, obj: str):
        self.metta.space().add_atom(E(S(relation), S(subject.lower()), ValueAtom(obj.lower())))

    def _query_single(self, relation: str, subject: str) -> List[str]:
        subject = subject.strip('"').lower()
        q = f'!(match &self ({relation} {subject} $x) $x)'
        result = self.metta.run(q)
        return [r[0].get_object().value for r in result if r and len(r) > 0]

    def map_skill_to_role(self, skill: str) -> List[str]:
        return self._query_single("skill_role", skill)

    def normalize_country(self, text: str) -> Optional[str]:
        text = text.lower()
        countries = self._query_single("country_alias", text)
        if countries:
            return countries[0]
        # try token by token
        for token in text.replace(",", " ").replace("\n", " ").split():
            countries = self._query_single("country_alias", token)
            if countries:
                return countries[0]
        return None

    def experience_bucket(self, years: int) -> str:
        # map years to buckets like 0-1, 2-3, 3, 3-5, 5+
        if years <= 1:
            return "0-1"
        if years == 2:
            return "2"
        if years == 3:
            return "3"
        if 4 <= years <= 5:
            return "4-5"
        return "6+"


