from hyperon import MeTTa, E, S, ValueAtom


def initialize_resume_knowledge(metta: MeTTa):
    """Seed minimal resume/job knowledge: skill→role and country aliases."""
    space = metta.space()

    # Skill → Role mappings (expandable)
    for skill, role in [
        ("react", "frontend engineer"),
        ("javascript", "frontend engineer"),
        ("typescript", "frontend engineer"),
        ("node.js", "backend engineer"),
        ("node", "backend engineer"),
        ("python", "software engineer"),
        ("java", "software engineer"),
        ("aws", "cloud engineer"),
        ("sql", "data engineer"),
        ("rest api", "backend engineer"),
        # Additional mappings for better role inference
        ("react native", "mobile engineer"),
        ("angular", "frontend engineer"),
        ("vue", "frontend engineer"),
        ("next.js", "frontend engineer"),
        ("graphql", "backend engineer"),
        ("go", "backend engineer"),
        ("golang", "backend engineer"),
        ("kotlin", "android developer"),
        ("swift", "ios developer"),
        ("docker", "devops engineer"),
        ("kubernetes", "devops engineer"),
        ("gcp", "cloud engineer"),
        ("azure", "cloud engineer"),
        ("pandas", "data engineer"),
        ("numpy", "data scientist"),
        ("spark", "data engineer"),
        ("airflow", "data engineer"),
        ("django", "backend engineer"),
        ("flask", "backend engineer"),
        ("express", "backend engineer"),
        ("spring", "backend engineer"),
        ("nestjs", "backend engineer"),
        ("postgresql", "backend engineer"),
        ("mysql", "backend engineer"),
        ("mongodb", "backend engineer"),
        ("tailwindcss", "frontend engineer"),
    ]:
        space.add_atom(E(S("skill_role"), S(skill), ValueAtom(role)))

    # Country aliases and normalization
    for alias, country in [
        ("in", "india"),
        ("india", "india"),
        ("bharat", "india"),
        # Common Indian cities → india
        ("bangalore", "india"),
        ("bengaluru", "india"),
        ("mumbai", "india"),
        ("pune", "india"),
        ("delhi", "india"),
        ("new delhi", "india"),
        ("hyderabad", "india"),
        ("chennai", "india"),
        ("noida", "india"),
        ("gurgaon", "india"),
        ("gurugram", "india"),
        ("ahmedabad", "india"),
        ("kolkata", "india"),
        ("us", "united states"),
        ("usa", "united states"),
        ("united states", "united states"),
        ("uk", "united kingdom"),
        ("united kingdom", "united kingdom"),
        ("london", "united kingdom"),
        ("remote", "remote"),
    ]:
        space.add_atom(E(S("country_alias"), S(alias), ValueAtom(country)))


