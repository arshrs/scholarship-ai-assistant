import json
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(current_dir)

# load scholarships
with open("scholarships.json", "r") as f:
    scholarships = json.load(f)

# user input
field = sys.argv[1].lower()
gender = sys.argv[2].lower()
income = int(sys.argv[3])
level = sys.argv[4].lower()

recommendations = []

for s in scholarships:

    if (s["field"] == "any" or s["field"] in field) and \
       (s["gender"] == "any" or s["gender"] == gender) and \
       income <= s["income_limit"] and \
       (s["level"] == level or s["level"] == "any"):

        recommendations.append(
            f'{s["name"]} — Benefit: {s["benefit"]}'
        )

if recommendations:
    print("\n".join(recommendations))
else:
    print("No matching scholarships found.")