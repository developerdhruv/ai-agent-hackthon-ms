from hyperon import MeTTa, E, S, ValueAtom


def initialize_education_knowledge(metta: MeTTa):
    space = metta.space()
    # Example topic: data structures and algorithms
    topic = "data structures and algorithms"
    for st in [
        "arrays", "linked lists", "stacks", "queues", "hash tables",
        "trees", "binary search trees", "graphs", "sorting", "searching",
    ]:
        space.add_atom(E(S("subtopic"), S(topic), ValueAtom(st)))
    for st in ["big-o notation", "recursion", "dynamic programming", "greedy algorithms"]:
        space.add_atom(E(S("subtopic_beginner"), S(topic), ValueAtom(st)))
    for st in ["graph shortest paths", "minimum spanning tree", "advanced dp", "string algorithms"]:
        space.add_atom(E(S("subtopic_intermediate"), S(topic), ValueAtom(st)))
    for st in ["suffix arrays/tries", "network flow", "segment trees", "heavy-light decomposition"]:
        space.add_atom(E(S("subtopic_advanced"), S(topic), ValueAtom(st)))

    # Resources: generic and level-specific
    space.add_atom(E(S("resource"), S(topic), ValueAtom("CLRS book (Introduction to Algorithms)")))
    space.add_atom(E(S("resource"), S(topic), ValueAtom("LeetCode practice")))
    space.add_atom(E(S("resource_beginner"), S(topic), ValueAtom("freeCodeCamp DSA playlist")))
    space.add_atom(E(S("resource_beginner"), S(topic), ValueAtom("Grokking Algorithms (book)")))
    space.add_atom(E(S("resource_intermediate"), S(topic), ValueAtom("Algorithms Illuminated (series)")))
    space.add_atom(E(S("resource_intermediate"), S(topic), ValueAtom("LeetCode patterns (NeetCode)")))
    space.add_atom(E(S("resource_advanced"), S(topic), ValueAtom("Competitive Programmer's Handbook")))
    space.add_atom(E(S("resource_advanced"), S(topic), ValueAtom("CP-Algorithms (e-maxx)")))

    # Example topic: frontend development
    ft = "frontend development"
    for st in ["html", "css", "javascript", "react", "state management", "testing"]:
        space.add_atom(E(S("subtopic"), S(ft), ValueAtom(st)))
    space.add_atom(E(S("resource"), S(ft), ValueAtom("MDN Web Docs")))
    space.add_atom(E(S("resource_beginner"), S(ft), ValueAtom("Frontend Masters beginner path")))
    for st in ["react hooks", "typescript", "next.js", "routing", "forms", "accessibility"]:
        space.add_atom(E(S("subtopic_intermediate"), S(ft), ValueAtom(st)))
    for st in ["performance optimization", "server components", "ssr/ssg", "web vitals", "testing-library"]:
        space.add_atom(E(S("subtopic_advanced"), S(ft), ValueAtom(st)))
    space.add_atom(E(S("resource_beginner"), S(ft), ValueAtom("React Docs (beta)")))
    space.add_atom(E(S("resource_intermediate"), S(ft), ValueAtom("Next.js Documentation")))
    space.add_atom(E(S("resource_intermediate"), S(ft), ValueAtom("TypeScript Handbook")))
    space.add_atom(E(S("resource_advanced"), S(ft), ValueAtom("Web.dev performance guides")))

    # Backend development
    bt = "backend development"
    for st in [
        "http fundamentals", "rest design", "authentication", "authorization", "databases",
        "caching", "message queues", "logging", "testing",
    ]:
        space.add_atom(E(S("subtopic"), S(bt), ValueAtom(st)))
    for st in ["express/django basics", "orm basics", "docker basics", "ci/cd basics"]:
        space.add_atom(E(S("subtopic_beginner"), S(bt), ValueAtom(st)))
    for st in ["microservices", "event-driven", "observability", "rate limiting", "api gateways"]:
        space.add_atom(E(S("subtopic_intermediate"), S(bt), ValueAtom(st)))
    for st in ["distributed transactions", "sagas", "idempotency", "resilience patterns"]:
        space.add_atom(E(S("subtopic_advanced"), S(bt), ValueAtom(st)))
    space.add_atom(E(S("resource_beginner"), S(bt), ValueAtom("Express.js Guide / Django Docs")))
    space.add_atom(E(S("resource_intermediate"), S(bt), ValueAtom("12-Factor App")))
    space.add_atom(E(S("resource_advanced"), S(bt), ValueAtom("Microservices.io patterns")))

    # Machine learning
    ml = "machine learning"
    for st in ["linear regression", "logistic regression", "overfitting", "cross-validation", "feature scaling"]:
        space.add_atom(E(S("subtopic_beginner"), S(ml), ValueAtom(st)))
    for st in ["tree-based models", "svm", "unsupervised learning", "feature engineering", "model evaluation"]:
        space.add_atom(E(S("subtopic_intermediate"), S(ml), ValueAtom(st)))
    for st in ["neural networks", "cnn/rnn", "transfer learning", "deployment (mlops)"]:
        space.add_atom(E(S("subtopic_advanced"), S(ml), ValueAtom(st)))
    space.add_atom(E(S("resource_beginner"), S(ml), ValueAtom("Andrew Ng ML (Coursera)")))
    space.add_atom(E(S("resource_intermediate"), S(ml), ValueAtom("Hands-On ML with Scikit-Learn & TensorFlow")))
    space.add_atom(E(S("resource_advanced"), S(ml), ValueAtom("FastAI Practical Deep Learning")))

    # Databases
    db = "databases"
    for st in ["relational basics", "sql", "indexes", "transactions", "normalization"]:
        space.add_atom(E(S("subtopic_beginner"), S(db), ValueAtom(st)))
    for st in ["query optimization", "replication", "sharding", "nosql (document/key-value)"]:
        space.add_atom(E(S("subtopic_intermediate"), S(db), ValueAtom(st)))
    for st in ["olap vs oltp", "time-series", "graph databases", "tuning & observability"]:
        space.add_atom(E(S("subtopic_advanced"), S(db), ValueAtom(st)))
    space.add_atom(E(S("resource_beginner"), S(db), ValueAtom("SQLZoo / W3Schools SQL")))
    space.add_atom(E(S("resource_intermediate"), S(db), ValueAtom("Use The Index, Luke")))
    space.add_atom(E(S("resource_advanced"), S(db), ValueAtom("Designing Data-Intensive Applications")))

    # System design
    sd = "system design"
    for st in [
        "scalability basics", "load balancing", "caching strategies", "cdn", "queues",
        "databases selection", "consistency", "cap theorem",
    ]:
        space.add_atom(E(S("subtopic"), S(sd), ValueAtom(st)))
    space.add_atom(E(S("resource_beginner"), S(sd), ValueAtom("System Design Primer (GitHub)")))
    space.add_atom(E(S("resource_intermediate"), S(sd), ValueAtom("Grokking the System Design Interview")))
    space.add_atom(E(S("resource_advanced"), S(sd), ValueAtom("High Scalability blog")))

    # Cloud fundamentals
    cf = "cloud fundamentals"
    for st in ["iam", "compute (ec2)", "storage (s3)", "serverless (lambda)", "networking (vpc)"]:
        space.add_atom(E(S("subtopic_beginner"), S(cf), ValueAtom(st)))
    for st in ["infrastructure as code", "containers (ecs/eks)", "monitoring/logging"]:
        space.add_atom(E(S("subtopic_intermediate"), S(cf), ValueAtom(st)))
    for st in ["multi-account strategy", "cost optimization", "resilience & dr"]:
        space.add_atom(E(S("subtopic_advanced"), S(cf), ValueAtom(st)))
    space.add_atom(E(S("resource_beginner"), S(cf), ValueAtom("AWS Skill Builder - Cloud Practitioner")))
    space.add_atom(E(S("resource_intermediate"), S(cf), ValueAtom("IaC with Terraform (HashiCorp Learn)")))
    space.add_atom(E(S("resource_advanced"), S(cf), ValueAtom("AWS Well-Architected Framework")))


