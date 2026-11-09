"""Seeded procedural layer planner. Prints a compact JSON description to stdout."""
import json
import random
import sys


def generate(depth: int) -> dict:
    depth = max(1, int(depth))
    rng = random.Random(419 + depth * 9187)
    wings = min(depth, 6)
    width = 2400 + 560 * (wings - 1)
    enemies = []
    for _ in range((depth - 1) * 2):
        enemies.append({"x": round(1000 + rng.random() * 500),
                        "y": round(350 + rng.random() * 250),
                        "kind": "wolf" if rng.random() < .5 else "wisp",
                        "hp": 58, "elite": False})
    for wing in range(1, wings):
        center = 2400 + 560 * (wing - 1)
        for index in range(3 + wing):
            enemies.append({"x": round(center + 80 + rng.random() * 320),
                            "y": round(360 + rng.random() * 320),
                            "kind": "wolf" if rng.random() < .5 else "wisp",
                            "hp": 58 + wing * 12, "elite": index == 0})
    return {"depth": depth, "worldWidth": width, "wingCount": wings,
            "bossIndex": (depth - 1) % 4,
            "difficulty": round(1 + .3 * (depth - 1), 3),
            "extraEnemies": enemies,
            "seed": 419 + depth * 9187}


if __name__ == "__main__":
    print(json.dumps(generate(sys.argv[1] if len(sys.argv) > 1 else 1),
                     separators=(",", ":")))
