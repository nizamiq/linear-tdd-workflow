#!/usr/bin/env python3
"""
Test Linear API connection and list available teams and projects
"""

import os
import requests
import json

# Configuration
LINEAR_API_KEY = os.getenv('LINEAR_API_KEY')
if not LINEAR_API_KEY:
    print("Error: LINEAR_API_KEY environment variable not set")
    sys.exit(1)
LINEAR_API_URL = "https://api.linear.app/graphql"

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

def main():
    print("=" * 60)
    print("Testing Linear API Connection")
    print("=" * 60)
    
    # Test 1: List all teams
    print("\n1. Available Teams:")
    print("-" * 40)
    
    query = """
    query {
        teams {
            nodes {
                id
                key
                name
                description
            }
        }
    }
    """
    
    data = graphql_request(query)
    if data and data.get("teams"):
        teams = data["teams"]["nodes"]
        for team in teams:
            print(f"   • Team: {team['name']}")
            print(f"     Key: {team['key']}")
            print(f"     ID: {team['id'][:8]}...")
            if team.get('description'):
                print(f"     Description: {team['description']}")
            print()
    else:
        print("   No teams found or error accessing teams")
    
    # Test 2: List all projects
    print("\n2. Available Projects:")
    print("-" * 40)
    
    query = """
    query {
        projects {
            nodes {
                id
                name
                description
                state
                progress
                teams {
                    nodes {
                        name
                        key
                    }
                }
            }
        }
    }
    """
    
    data = graphql_request(query)
    if data and data.get("projects"):
        projects = data["projects"]["nodes"]
        for project in projects:
            print(f"   • Project: {project['name']}")
            print(f"     ID: {project['id'][:8]}...")
            print(f"     State: {project['state']}")
            print(f"     Progress: {project['progress']*100:.1f}%")
            if project.get('teams') and project['teams']['nodes']:
                teams = ", ".join([t['name'] + f" ({t['key']})" for t in project['teams']['nodes']])
                print(f"     Teams: {teams}")
            print()
    else:
        print("   No projects found or error accessing projects")
    
    # Test 3: List cycles
    print("\n3. Available Cycles:")
    print("-" * 40)
    
    query = """
    query {
        cycles(first: 10) {
            nodes {
                id
                name
                number
                startsAt
                endsAt
                team {
                    name
                    key
                }
            }
        }
    }
    """
    
    data = graphql_request(query)
    if data and data.get("cycles"):
        cycles = data["cycles"]["nodes"]
        for cycle in cycles:
            print(f"   • Cycle: {cycle['name']}")
            print(f"     Number: {cycle['number']}")
            if cycle.get('team'):
                print(f"     Team: {cycle['team']['name']} ({cycle['team']['key']})")
            print(f"     Period: {cycle['startsAt'][:10]} to {cycle['endsAt'][:10]}")
            print()
    else:
        print("   No cycles found or error accessing cycles")
    
    # Test 4: Get current user
    print("\n4. Current User:")
    print("-" * 40)
    
    query = """
    query {
        viewer {
            id
            name
            email
            admin
        }
    }
    """
    
    data = graphql_request(query)
    if data and data.get("viewer"):
        user = data["viewer"]
        print(f"   • Name: {user['name']}")
        print(f"     Email: {user['email']}")
        print(f"     Admin: {user['admin']}")
    else:
        print("   Could not get current user")

if __name__ == "__main__":
    main()
