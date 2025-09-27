#!/usr/bin/env python3
"""
Create cycles in Linear for the a-coders team
"""

import os
import requests
from datetime import datetime, timedelta
import json

# Configuration
LINEAR_API_KEY = os.getenv('LINEAR_API_KEY', os.getenv('LINEAR_API_KEY'))
LINEAR_API_URL = "https://api.linear.app/graphql"
TEAM_KEY = "ACO"

# Headers for Linear API
headers = {
    "Authorization": LINEAR_API_KEY,
    "Content-Type": "application/json"
}

def graphql_request(query: str, variables: dict = None) -> dict:
    """Execute a GraphQL query against Linear API"""
    response = requests.post(
        LINEAR_API_URL,
        headers=headers,
        json={"query": query, "variables": variables or {}}
    )
    
    if response.status_code != 200:
        print(f"Error: {response.status_code} - {response.text}")
        return None
    
    result = response.json()
    if "errors" in result:
        print(f"GraphQL Error: {result['errors']}")
        return None
    
    return result.get("data")

def get_team():
    """Get team ID"""
    query = """
    query {
        teams {
            nodes {
                id
                key
                name
            }
        }
    }
    """
    
    data = graphql_request(query)
    if data:
        for team in data["teams"]["nodes"]:
            if team["key"].lower() == TEAM_KEY.lower():
                return team
    return None

def get_existing_cycles(team_id):
    """Get existing cycles for the team"""
    query = """
    query GetCycles($teamId: String!) {
        team(id: $teamId) {
            cycles(first: 10) {
                nodes {
                    id
                    name
                    number
                    startsAt
                    endsAt
                }
            }
            activeCycle {
                id
                name
                startsAt
                endsAt
            }
        }
    }
    """
    
    data = graphql_request(query, {"teamId": team_id})
    if data:
        return data["team"]
    return None

def create_cycle(team_id, name, start_date, end_date):
    """Create a new cycle"""
    mutation = """
    mutation CreateCycle($input: CycleCreateInput!) {
        cycleCreate(input: $input) {
            success
            cycle {
                id
                name
                number
                startsAt
                endsAt
            }
        }
    }
    """
    
    variables = {
        "input": {
            "teamId": team_id,
            "name": name,
            "startsAt": start_date.isoformat() + "Z",
            "endsAt": end_date.isoformat() + "Z"
        }
    }
    
    data = graphql_request(mutation, variables)
    if data and data["cycleCreate"]["success"]:
        return data["cycleCreate"]["cycle"]
    return None

def main():
    print("=" * 60)
    print("Linear Cycle Creation Script")
    print("=" * 60)
    
    # Get team
    team = get_team()
    if not team:
        print("❌ Could not find team")
        return
    
    print(f"\n✓ Found team: {team['name']} ({team['key']})")
    
    # Check existing cycles
    print("\n📅 Checking existing cycles...")
    team_data = get_existing_cycles(team["id"])
    
    if team_data:
        if team_data.get("activeCycle"):
            print(f"  Active Cycle: {team_data['activeCycle']['name']}")
            print(f"    Period: {team_data['activeCycle']['startsAt'][:10]} to {team_data['activeCycle']['endsAt'][:10]}")
        
        cycles = team_data.get("cycles", {}).get("nodes", [])
        if cycles:
            print(f"\n  Found {len(cycles)} existing cycle(s):")
            for cycle in cycles[:3]:  # Show last 3 cycles
                print(f"    • {cycle['name']} ({cycle['startsAt'][:10]} to {cycle['endsAt'][:10]})")
    
    # Ask if user wants to create cycles
    print("\n" + "=" * 60)
    print("📋 Cycle Creation Options")
    print("=" * 60)
    print("\n1. Create current cycle (starts today, 2 weeks)")
    print("2. Create next cycle (starts in 2 weeks, 2 weeks duration)")
    print("3. Create both current and next cycles")
    print("4. Skip cycle creation")
    
    choice = input("\nChoose an option (1-4): ")
    
    if choice == "4":
        print("\n✅ Skipping cycle creation")
        return
    
    created_cycles = []
    
    # Get the next Monday
    today = datetime.now()
    days_until_monday = (7 - today.weekday()) % 7
    if days_until_monday == 0 and today.hour >= 12:  # If it's Monday afternoon, start next Monday
        days_until_monday = 7
    next_monday = today + timedelta(days=days_until_monday)
    next_monday = next_monday.replace(hour=0, minute=0, second=0, microsecond=0)
    
    if choice in ["1", "3"]:
        # Create current cycle
        current_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
        current_end = current_start + timedelta(days=13, hours=23, minutes=59)  # 2 weeks minus 1 second
        
        print(f"\n📅 Creating current cycle...")
        current_cycle = create_cycle(
            team["id"],
            f"Sprint {today.strftime('%Y-%m-%d')}",
            current_start,
            current_end
        )
        
        if current_cycle:
            print(f"  ✅ Created: {current_cycle['name']}")
            print(f"     Period: {current_cycle['startsAt'][:10]} to {current_cycle['endsAt'][:10]}")
            created_cycles.append(current_cycle)
        else:
            print("  ❌ Failed to create current cycle")
    
    if choice in ["2", "3"]:
        # Create next cycle
        if choice == "2":
            # If only creating next cycle, start from next Monday
            next_start = next_monday
        else:
            # If creating both, start after current cycle
            next_start = current_end + timedelta(seconds=1) if choice == "3" else next_monday
        
        next_end = next_start + timedelta(days=13, hours=23, minutes=59)
        
        print(f"\n📅 Creating next cycle...")
        next_cycle = create_cycle(
            team["id"],
            f"Sprint {next_start.strftime('%Y-%m-%d')}",
            next_start,
            next_end
        )
        
        if next_cycle:
            print(f"  ✅ Created: {next_cycle['name']}")
            print(f"     Period: {next_cycle['startsAt'][:10]} to {next_cycle['endsAt'][:10]}")
            created_cycles.append(next_cycle)
        else:
            print("  ❌ Failed to create next cycle")
    
    # Summary
    if created_cycles:
        print("\n" + "=" * 60)
        print("✅ Cycle Creation Complete!")
        print("=" * 60)
        print(f"\nCreated {len(created_cycles)} cycle(s):")
        for cycle in created_cycles:
            print(f"  • {cycle['name']}")
        
        print("\n🔗 View in Linear:")
        print(f"   https://linear.app/team/{team['key']}/cycles")
        
        print("\n📝 Next Steps:")
        print("1. Run the cycle planning script again")
        print("2. The script will now find your cycles and plan accordingly")
        
        # Save cycle data
        with open("created_cycles.json", "w") as f:
            json.dump(created_cycles, f, indent=2)
        print("\n💾 Cycle data saved to: created_cycles.json")

if __name__ == "__main__":
    main()
