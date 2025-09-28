#!/usr/bin/env python3

"""
Python Test Runner - TDD enforcement for Python code
Supports pytest, unittest, coverage.py, and mutmut for mutation testing
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import re
from datetime import datetime

class PythonTestRunner:
    """
    Manages Python test execution with TDD enforcement
    """

    def __init__(self, project_root: Path = None):
        self.project_root = project_root or Path.cwd()
        self.coverage_threshold = 80  # Diff coverage requirement
        self.mutation_threshold = 30  # Mutation testing requirement

    def run_tdd_cycle(self, changed_files: List[str]) -> Dict:
        """
        Execute RED→GREEN→REFACTOR cycle for Python code
        """
        results = {
            'timestamp': datetime.now().isoformat(),
            'language': 'python',
            'phases': {}
        }

        # Phase 1: RED - Ensure tests exist and fail initially
        print("🔴 RED Phase: Writing failing tests...")
        results['phases']['red'] = self.validate_red_phase(changed_files)

        # Phase 2: GREEN - Run tests and check coverage
        print("🟢 GREEN Phase: Making tests pass...")
        results['phases']['green'] = self.validate_green_phase(changed_files)

        # Phase 3: REFACTOR - Ensure tests still pass after refactoring
        print("🔵 REFACTOR Phase: Improving code quality...")
        results['phases']['refactor'] = self.validate_refactor_phase()

        # Mutation testing
        print("🧬 Mutation Testing...")
        results['mutation'] = self.run_mutation_testing(changed_files)

        return results

    def validate_red_phase(self, changed_files: List[str]) -> Dict:
        """
        Ensure test files exist for changed source files
        """
        missing_tests = []
        test_files = []

        for file in changed_files:
            if file.endswith('.py') and not self.is_test_file(file):
                test_file = self.get_test_file_path(file)
                if not test_file.exists():
                    missing_tests.append(str(test_file))
                else:
                    test_files.append(str(test_file))

        if missing_tests:
            # Generate test templates
            for test_file in missing_tests:
                self.generate_test_template(test_file)

        return {
            'status': 'pass' if not missing_tests else 'generated',
            'test_files': test_files,
            'generated_tests': missing_tests
        }

    def validate_green_phase(self, changed_files: List[str]) -> Dict:
        """
        Run tests and validate coverage
        """
        # Run pytest with coverage
        coverage_result = self.run_coverage(changed_files)

        # Check diff coverage
        diff_coverage = self.calculate_diff_coverage(changed_files)

        return {
            'status': 'pass' if diff_coverage >= self.coverage_threshold else 'fail',
            'overall_coverage': coverage_result['total_coverage'],
            'diff_coverage': diff_coverage,
            'threshold': self.coverage_threshold,
            'test_results': coverage_result['test_results']
        }

    def validate_refactor_phase(self) -> Dict:
        """
        Run linting and formatting checks
        """
        checks = {}

        # Run Black (formatter)
        checks['black'] = self.run_black_check()

        # Run Ruff (linter)
        checks['ruff'] = self.run_ruff_check()

        # Run mypy (type checker)
        checks['mypy'] = self.run_mypy_check()

        # Run pylint (comprehensive linter)
        checks['pylint'] = self.run_pylint_check()

        all_passed = all(check['status'] == 'pass' for check in checks.values())

        return {
            'status': 'pass' if all_passed else 'fail',
            'checks': checks
        }

    def run_coverage(self, changed_files: List[str]) -> Dict:
        """
        Run pytest with coverage measurement
        """
        try:
            # Run pytest with coverage
            cmd = [
                'pytest',
                '--cov=' + ','.join(self.get_source_dirs()),
                '--cov-report=json',
                '--cov-report=term',
                '-v'
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)

            # Parse coverage report
            coverage_file = Path('coverage.json')
            if coverage_file.exists():
                with open(coverage_file) as f:
                    coverage_data = json.load(f)

                total_coverage = coverage_data.get('totals', {}).get('percent_covered', 0)

                return {
                    'status': 'pass' if result.returncode == 0 else 'fail',
                    'total_coverage': total_coverage,
                    'test_results': {
                        'passed': result.returncode == 0,
                        'output': result.stdout
                    }
                }

        except subprocess.CalledProcessError as e:
            return {
                'status': 'error',
                'error': str(e),
                'total_coverage': 0,
                'test_results': {'passed': False}
            }

    def calculate_diff_coverage(self, changed_files: List[str]) -> float:
        """
        Calculate coverage for changed lines only
        """
        try:
            # Get git diff for changed files
            diff_cmd = ['git', 'diff', '--unified=0'] + changed_files
            diff_result = subprocess.run(diff_cmd, capture_output=True, text=True)

            # Parse diff to find changed lines
            changed_lines = self.parse_diff_lines(diff_result.stdout)

            # Load coverage data
            coverage_file = Path('.coverage')
            if not coverage_file.exists():
                # Run coverage first
                subprocess.run(['coverage', 'run', '-m', 'pytest'], capture_output=True)

            # Get coverage for changed lines
            covered = 0
            total = 0

            for file, lines in changed_lines.items():
                file_coverage = self.get_file_coverage(file)
                for line_num in lines:
                    total += 1
                    if line_num in file_coverage:
                        covered += 1

            return (covered / total * 100) if total > 0 else 100

        except Exception as e:
            print(f"Error calculating diff coverage: {e}")
            return 0

    def run_mutation_testing(self, changed_files: List[str]) -> Dict:
        """
        Run mutation testing with mutmut
        """
        try:
            # Filter for Python source files
            source_files = [f for f in changed_files if f.endswith('.py') and not self.is_test_file(f)]

            if not source_files:
                return {'status': 'skip', 'reason': 'No source files to mutate'}

            # Run mutmut on changed files
            results = []
            for file in source_files[:5]:  # Limit to 5 files for performance
                cmd = ['mutmut', 'run', '--paths-to-mutate=' + file]
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)

                # Parse mutmut results
                if 'killed' in result.stdout and 'survived' in result.stdout:
                    killed = int(re.search(r'killed: (\d+)', result.stdout).group(1))
                    survived = int(re.search(r'survived: (\d+)', result.stdout).group(1))
                    total = killed + survived

                    mutation_score = (killed / total * 100) if total > 0 else 0

                    results.append({
                        'file': file,
                        'killed': killed,
                        'survived': survived,
                        'score': mutation_score
                    })

            avg_score = sum(r['score'] for r in results) / len(results) if results else 0

            return {
                'status': 'pass' if avg_score >= self.mutation_threshold else 'fail',
                'average_score': avg_score,
                'threshold': self.mutation_threshold,
                'file_results': results
            }

        except subprocess.TimeoutExpired:
            return {'status': 'timeout', 'error': 'Mutation testing timed out'}
        except Exception as e:
            return {'status': 'error', 'error': str(e)}

    def run_black_check(self) -> Dict:
        """
        Check Python formatting with Black
        """
        try:
            result = subprocess.run(
                ['black', '--check', '.'],
                capture_output=True,
                text=True
            )
            return {
                'status': 'pass' if result.returncode == 0 else 'fail',
                'message': 'Code is formatted' if result.returncode == 0 else 'Formatting issues found'
            }
        except subprocess.CalledProcessError:
            return {'status': 'error', 'message': 'Black not installed'}

    def run_ruff_check(self) -> Dict:
        """
        Run Ruff linter
        """
        try:
            result = subprocess.run(
                ['ruff', 'check', '.'],
                capture_output=True,
                text=True
            )
            return {
                'status': 'pass' if result.returncode == 0 else 'fail',
                'issues': result.stdout.count('\n') if result.returncode != 0 else 0
            }
        except subprocess.CalledProcessError:
            return {'status': 'error', 'message': 'Ruff not installed'}

    def run_mypy_check(self) -> Dict:
        """
        Run mypy type checker
        """
        try:
            result = subprocess.run(
                ['mypy', '.', '--ignore-missing-imports'],
                capture_output=True,
                text=True
            )
            return {
                'status': 'pass' if result.returncode == 0 else 'fail',
                'errors': result.stdout.count('error:')
            }
        except subprocess.CalledProcessError:
            return {'status': 'error', 'message': 'mypy not installed'}

    def run_pylint_check(self) -> Dict:
        """
        Run pylint
        """
        try:
            result = subprocess.run(
                ['pylint', '--exit-zero', '--output-format=json', '.'],
                capture_output=True,
                text=True
            )

            if result.stdout:
                issues = json.loads(result.stdout)
                score = 10 - (len(issues) * 0.1)  # Simple scoring
                return {
                    'status': 'pass' if score >= 7 else 'fail',
                    'score': max(0, score),
                    'issues': len(issues)
                }
            return {'status': 'pass', 'score': 10, 'issues': 0}

        except subprocess.CalledProcessError:
            return {'status': 'error', 'message': 'pylint not installed'}

    def generate_test_template(self, test_file: str):
        """
        Generate a test file template
        """
        test_path = Path(test_file)
        test_path.parent.mkdir(parents=True, exist_ok=True)

        # Extract module name from path
        module_name = test_path.stem.replace('test_', '')

        template = f'''"""
Tests for {module_name} module
Generated by TDD enforcer
"""

import pytest
from unittest.mock import Mock, patch
import sys
import os

# Add source to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import module under test
# from {module_name} import YourClass, your_function


class Test{module_name.title()}:
    """Test cases for {module_name}"""

    def setup_method(self):
        """Set up test fixtures"""
        pass

    def teardown_method(self):
        """Clean up after tests"""
        pass

    def test_example_should_fail(self):
        """This test should fail initially (RED phase)"""
        assert False, "Implement this test"

    def test_example_with_mock(self):
        """Example test with mocking"""
        mock_obj = Mock()
        mock_obj.method.return_value = "expected"

        assert mock_obj.method() == "expected"
        mock_obj.method.assert_called_once()

    @pytest.mark.parametrize("input_val,expected", [
        (1, 2),
        (2, 4),
        (3, 6),
    ])
    def test_parametrized(self, input_val, expected):
        """Example parametrized test"""
        # result = your_function(input_val)
        # assert result == expected
        pass

    @pytest.fixture
    def sample_data(self):
        """Fixture providing sample data"""
        return {{"key": "value"}}

    def test_with_fixture(self, sample_data):
        """Test using fixture"""
        assert "key" in sample_data
'''

        with open(test_path, 'w') as f:
            f.write(template)

        print(f"✅ Generated test template: {test_file}")

    def is_test_file(self, filepath: str) -> bool:
        """
        Check if file is a test file
        """
        return any([
            'test_' in filepath,
            '_test.py' in filepath,
            '/tests/' in filepath,
            '/test/' in filepath
        ])

    def get_test_file_path(self, source_file: str) -> Path:
        """
        Get corresponding test file path for a source file
        """
        source_path = Path(source_file)

        # Handle different test directory structures
        if 'src' in source_path.parts:
            # src/module.py -> tests/test_module.py
            test_path = Path('tests') / f"test_{source_path.stem}.py"
        else:
            # module.py -> tests/test_module.py
            test_path = Path('tests') / f"test_{source_path.stem}.py"

        return test_path

    def get_source_dirs(self) -> List[str]:
        """
        Get source directories for coverage
        """
        dirs = []
        for pattern in ['src', 'lib', 'app']:
            if Path(pattern).exists():
                dirs.append(pattern)
        return dirs or ['.']

    def parse_diff_lines(self, diff_output: str) -> Dict[str, List[int]]:
        """
        Parse git diff to extract changed line numbers
        """
        changed_lines = {}
        current_file = None

        for line in diff_output.split('\n'):
            if line.startswith('+++'):
                current_file = line[6:] if line[6:] != '/dev/null' else None
                if current_file and current_file.startswith('b/'):
                    current_file = current_file[2:]
                if current_file:
                    changed_lines[current_file] = []

            elif line.startswith('@@') and current_file:
                # Parse line numbers from @@ -l1,s1 +l2,s2 @@
                match = re.match(r'@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@', line)
                if match:
                    start_line = int(match.group(1))
                    line_count = int(match.group(2)) if match.group(2) else 1
                    changed_lines[current_file].extend(
                        range(start_line, start_line + line_count)
                    )

        return changed_lines

    def get_file_coverage(self, filepath: str) -> List[int]:
        """
        Get covered line numbers for a file
        """
        try:
            # Use coverage.py API to get line coverage
            result = subprocess.run(
                ['coverage', 'json', '-o', '-'],
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                coverage_data = json.loads(result.stdout)
                file_data = coverage_data.get('files', {}).get(filepath, {})
                return file_data.get('executed_lines', [])

        except Exception:
            pass

        return []


def main():
    """
    CLI interface for Python test runner
    """
    parser = argparse.ArgumentParser(description='Python TDD Test Runner')
    parser.add_argument(
        'command',
        choices=['test', 'coverage', 'mutation', 'tdd', 'check'],
        help='Command to execute'
    )
    parser.add_argument(
        '--files',
        nargs='+',
        help='Files to test'
    )
    parser.add_argument(
        '--threshold',
        type=int,
        default=80,
        help='Coverage threshold (default: 80)'
    )

    args = parser.parse_args()

    runner = PythonTestRunner()

    if args.threshold:
        runner.coverage_threshold = args.threshold

    if args.command == 'tdd':
        # Full TDD cycle
        files = args.files or ['*.py']
        results = runner.run_tdd_cycle(files)

        print("\n📊 TDD Cycle Results:")
        print(json.dumps(results, indent=2))

        # Exit with error if any phase failed
        all_passed = all(
            phase.get('status') in ['pass', 'generated', 'skip']
            for phase in results['phases'].values()
        )

        sys.exit(0 if all_passed else 1)

    elif args.command == 'coverage':
        # Just run coverage
        files = args.files or ['.']
        result = runner.run_coverage(files)
        print(json.dumps(result, indent=2))

    elif args.command == 'mutation':
        # Just run mutation testing
        files = args.files or ['*.py']
        result = runner.run_mutation_testing(files)
        print(json.dumps(result, indent=2))

    elif args.command == 'check':
        # Run all checks
        result = runner.validate_refactor_phase()
        print(json.dumps(result, indent=2))
        sys.exit(0 if result['status'] == 'pass' else 1)

    else:
        # Basic test run
        subprocess.run(['pytest', '-v'])


if __name__ == '__main__':
    main()