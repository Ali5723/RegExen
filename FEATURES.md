# RegExen — Feature Tree

> RegExen is a tool that helps developers write, test, visualize, and understand regular expressions.

**Purpose:** Build a developer-focused regular expression workbench that combines testing, explanations, execution visualization, automata exploration, performance analysis, and engine compatibility.

**Status:** This document describes the proposed feature set. It does not imply that every feature has been implemented. (DEVELOPER ONLY FILE!!)

---

## Priority Legend

- [P0] Essential for the MVP
- [P1] Core feature that makes the product useful
- [P2] Advanced feature
- [P3] Future enhancement

---

# 1. Regex Workspace

The main environment for creating, editing, and experimenting with regular expressions.

```text
Regex Workspace
├── Pattern Editor [P0]
│   ├── Syntax highlighting
│   ├── Pattern input
│   ├── Inline syntax error indicators
│   ├── Error messages with positions
│   ├── Parenthesis and bracket matching
│   ├── Token selection and navigation
│   ├── Line and column information for multiline patterns
│   └── Copy pattern
│
├── Regex Flags [P0]
│   ├── Global (g)
│   ├── Case-insensitive (i)
│   ├── Multiline (m)
│   ├── Dot-all (s)
│   ├── Unicode (u)
│   ├── Unicode sets (v), where supported
│   └── Sticky (y)
│
├── Test Input Editor [P0]
│   ├── Plain text input
│   ├── Multiline text
│   ├── Large input handling
│   ├── Sample input templates
│   ├── Clear input
│   └── Load example
│
├── Live Preview [P0]
│   ├── Automatic matching after edits
│   ├── Debounced updates
│   ├── Match count
│   ├── No-match state
│   └── Invalid-pattern state
│
├── Workspace Layout [P1]
│   ├── Resizable panels
│   ├── Collapsible panels
│   ├── Reset layout
│   └── Remember panel preferences
│
└── Keyboard Shortcuts [P1]
    ├── Focus pattern editor
    ├── Focus test input
    ├── Copy pattern
    ├── Clear input
    └── Toggle supported panels
```

### Detailed requirements

- Syntax errors must be distinguishable from patterns that simply produce no matches.
- Flag availability must depend on the selected regex engine.
- The interface should avoid rerunning expensive analysis on every keystroke.
- Pattern and input editing should remain responsive with reasonable input limits.
- Every flag should have a short explanation and an example.

# 2. Match Tester

Test a regular expression against text and inspect every match and capture.

```
Match Tester
├── Match Detection [P0]
│   ├── Highlight matches in the input
│   ├── Show match count
│   ├── Navigate between matches
│   ├── Show matched text
│   ├── Show match index
│   ├── Show start and end positions
│   └── Handle no matches
│
├── Match Details [P0]
│   ├── Full match
│   ├── Capturing groups
│   ├── Named capturing groups
│   ├── Unmatched optional groups
│   ├── Group numbering
│   └── Copy individual match details
│
├── Position Inspector [P1]
│   ├── Character index
│   ├── Start and end offsets
│   ├── Line and column positions
│   └── Unicode-aware position explanations
│
├── Multiple Test Inputs [P1]
│   ├── Separate test cases
│   ├── Run the same pattern against all cases
│   ├── Compare results
│   └── Show case-specific errors
│
└── Edge Cases [P1]
    ├── Zero-length matches
    ├── Global matching
    ├── Sticky matching
    ├── Newline behavior
    ├── Unicode characters
    └── Empty input
```

### Detailed requirements

- Show matches in the order returned by the selected engine.
- Explain that some engines use UTF-16 code-unit offsets while other tools may display Unicode code points or grapheme positions.
- Make the chosen indexing convention explicit.
- Avoid infinite loops when a global expression produces a zero-length match.
- Do not silently modify the original pattern or input.

# 3. Regex Explainer

Explain what a regular expression means in understandable language.

```
Regex Explainer
├── Token Breakdown [P1]
│   ├── Literal characters
│   ├── Character classes
│   ├── Character class ranges
│   ├── Predefined character classes
│   ├── Quantifiers
│   ├── Capturing groups
│   ├── Non-capturing groups
│   ├── Named groups
│   ├── Alternation
│   ├── Lookahead assertions
│   ├── Lookbehind assertions
│   ├── Word boundaries
│   ├── Anchors
│   ├── Backreferences
│   └── Escaped characters
│
├── Hierarchical Syntax Tree [P1]
│   ├── Root expression
│   ├── Sequence nodes
│   ├── Alternation nodes
│   ├── Group nodes
│   ├── Repetition nodes
│   ├── Assertion nodes
│   └── Character and literal nodes
│
├── Plain-Language Explanation [P1]
│   ├── Explain each token
│   ├── Explain quantifier ranges
│   ├── Explain group behavior
│   ├── Explain anchors and boundaries
│   └── Explain the overall pattern
│
├── Flags Explanation [P1]
│   ├── Explain each enabled flag
│   ├── Show its effect on matching
│   └── Provide before-and-after examples
│
├── Error Explanation [P1]
│   ├── Unexpected token
│   ├── Unclosed group
│   ├── Invalid character class
│   ├── Invalid quantifier
│   ├── Unsupported feature
│   └── Suggested correction
│
└── Quick Reference [P0]
    ├── Common tokens
    ├── Quantifier table
    ├── Group syntax
    ├── Assertions
    ├── Escaping rules
    └── Common examples
```

### Detailed requirements

- Explanations should distinguish syntax from behavior.
- When a pattern contains nested groups, the explanation should preserve their hierarchy.
- Error messages should identify the approximate source position whenever possible.
- Suggested corrections must be presented as suggestions, not silently applied changes.
- Unsupported syntax should be reported explicitly rather than incorrectly explained.

# 4. Execution Visualizer

Show how a regular expression engine evaluates a pattern against input.

This is one of the main opportunities for RegExen to become more than a basic regex tester.

```
Execution Visualizer
├── Execution Trace [P2]
│   ├── Step-by-step execution
│   ├── Next step
│   ├── Previous step
│   ├── Play and pause
│   ├── Restart execution
│   ├── Playback speed
│   └── Jump to selected step
│
├── Current Execution State [P2]
│   ├── Current input position
│   ├── Active pattern token
│   ├── Current group
│   ├── Current match attempt
│   ├── Captured group values
│   └── Current execution status
│
├── Matching Decisions [P2]
│   ├── Successful token match
│   ├── Failed token match
│   ├── Alternative selection
│   ├── Quantifier expansion
│   ├── Greedy behavior
│   ├── Lazy behavior
│   ├── Assertion evaluation
│   └── Backtracking events
│
├── Visual Indicators [P2]
│   ├── Highlight current token
│   ├── Highlight current input character
│   ├── Display current group
│   ├── Display captures
│   ├── Distinguish success and failure
│   └── Display execution history
│
├── Trace Controls [P2]
│   ├── Maximum step count
│   ├── Maximum trace size
│   ├── Stop execution
│   ├── Truncation warning
│   └── Reset trace
│
└── Trace Explanation [P2]
    ├── Why a token matched
    ├── Why a token failed
    ├── Why an alternative was attempted
    ├── Why the engine backtracked
    └── Why the overall match succeeded or failed
```

### Important implementation constraint

JavaScript's built-in `RegExp` API does not expose every internal matching step. A faithful execution trace therefore requires a dedicated interpreter for a documented subset of regex syntax, or an integration with an engine that exposes tracing information.

RegExen must distinguish between:

- Engine result: The actual result returned by the selected regex engine.
- Simulated trace: An explanation generated by RegExen's own interpreter.
- Partial trace: A trace stopped because of configured execution or memory limits.

The interface must never present a simulated trace as a guaranteed record of the internal steps taken by the native engine.

# 5. Automata Explorer

Convert supported regular expressions into state machines and visualize their structure.

```
Automata Explorer
├── Regex Parsing [P2]
│   ├── Parse pattern into syntax tree
│   ├── Validate supported syntax
│   └── Report unsupported constructs
│
├── NFA Generation [P2]
│   ├── Build states
│   ├── Build transitions
│   ├── Generate epsilon transitions
│   ├── Mark initial state
│   └── Mark accepting states
│
├── Graph Visualization [P2]
│   ├── Display states and transitions
│   ├── Label transitions
│   ├── Highlight active state
│   ├── Highlight transition paths
│   ├── Zoom and pan
│   └── Reset graph layout
│
├── Input Simulation [P2]
│   ├── Run input through the automaton
│   ├── Animate state transitions
│   ├── Display current input position
│   ├── Show accepting paths
│   └── Explain rejected paths
│
├── DFA Conversion [P3]
│   ├── Convert supported NFA to DFA
│   ├── Display resulting states
│   └── Compare NFA and DFA
│
└── DFA Minimization [P3]
    ├── Minimize supported DFA
    ├── Display before-and-after graphs
    └── Explain state reduction
```

### Detailed requirements

- State-machine conversion must clearly define which regex features are supported.
- Backreferences and other non-regular constructs cannot be represented by an ordinary finite automaton in the general case.
- Lookarounds, Unicode behavior, and engine-specific semantics may require restrictions or special handling.
- The UI should explain when a conversion is incomplete or unavailable.
- Large graphs should support limits and a way to simplify the view.

# 6. Performance Lab

Investigate how a pattern behaves as the input changes.

```
Performance Lab
├── Benchmark Runner [P2]
│   ├── Run pattern against selected inputs
│   ├── Warm-up runs
│   ├── Repeated measurements
│   ├── Average and median duration
│   ├── Input-size comparison
│   └── Benchmark history
│
├── Performance Visualization [P2]
│   ├── Runtime by input size
│   ├── Input length comparison
│   ├── Compare two patterns
│   └── Export benchmark results
│
├── Static Risk Analysis [P2]
│   ├── Nested quantifier warnings
│   ├── Potentially overlapping alternatives
│   ├── Ambiguous repetition warnings
│   ├── Risky unbounded repetition patterns
│   └── Explain the reason for each warning
│
├── ReDoS Awareness [P2]
│   ├── Explain regular expression denial of service
│   ├── Flag suspicious structures
│   ├── Explain potentially expensive input shapes
│   ├── Suggest safer alternatives
│   └── Link to educational resources
│
└── Execution Safety [P1]
    ├── Run expensive work in a Web Worker
    ├── Configurable input-size limits
    ├── Execution timeout
    ├── Cancellation support
    ├── Memory-conscious result handling
    └── Clear warning when a run is stopped
```

### Detailed requirements

- Performance results should be treated as measurements, not universal guarantees.
- Results vary by browser, engine, hardware, input, and system load.
- Expensive regex tests should not block the main UI thread.
- Static ReDoS analysis should report potential risk, not claim that every flagged pattern is exploitable.
- Never automatically run unbounded, attacker-controlled benchmark inputs.
- A timeout must be described accurately: a Worker can be terminated, but not every execution environment offers the same guarantees.

# 7. Compatibility Lab

Understand differences between regex engines and flavors.

```
Compatibility Lab
├── Engine Selection [P1]
│   ├── JavaScript
│   ├── PCRE2
│   ├── Python
│   ├── Java
│   ├── .NET
│   └── Additional engines through adapters
│
├── Feature Support Matrix [P2]
│   ├── Named groups
│   ├── Lookbehind
│   ├── Unicode properties
│   ├── Backreferences
│   ├── Atomic groups
│   ├── Possessive quantifiers
│   ├── Inline modifiers
│   └── Engine-specific features
│
├── Compatibility Diagnostics [P2]
│   ├── Syntax unsupported by target engine
│   ├── Unsupported flags
│   ├── Different escape semantics
│   ├── Different Unicode behavior
│   ├── Different capture behavior
│   └── Potential semantic differences
│
└── Pattern Conversion [P3]
    ├── Select source engine
    ├── Select target engine
    ├── Suggest syntax changes
    ├── Show before-and-after patterns
    ├── Explain each transformation
    └── Warn when conversion is not equivalent
```

### Detailed requirements

- Engine selection must reflect the engine actually used for execution.
- Do not imply that a pattern has been tested against PCRE2, Python, or another engine unless that engine is genuinely available.
- Conversion should be conservative.
- When equivalent behavior cannot be guaranteed, show a warning and ask the developer to validate the result.

# 8. Replace & Extract

Use regex patterns to transform text and extract structured information.

```
Replace & Extract
├── Replacement Editor [P1]
│   ├── Replacement string
│   ├── Preview replacements
│   ├── First-match replacement
│   ├── Global replacement
│   ├── Capture-group references
│   ├── Named-group references
│   └── Invalid-reference warnings
│
├── Replacement Preview [P1]
│   ├── Original text
│   ├── Resulting text
│   ├── Highlight changed regions
│   ├── Show replacement count
│   └── Copy result
│
├── Data Extraction [P1]
│   ├── Extract full matches
│   ├── Extract capturing groups
│   ├── Extract named groups
│   ├── Display results as a table
│   └── Handle missing groups
│
├── Export [P1]
│   ├── Plain text
│   ├── JSON
│   ├── CSV
│   └── Copy to clipboard
│
└── Transformation Pipeline [P3]
    ├── Chain multiple transformations
    ├── Preview each stage
    ├── Reorder stages
    └── Export final output
```

### Detailed requirements

- Replacement syntax differs between engines and APIs.
- The replacement editor must use the selected engine's documented syntax.
- Previewing changes must not mutate the original input.
- Large extraction results should be limited or paginated.

# 9. Test Cases & Regression Testing

Save examples and verify that a pattern continues to behave as expected.

```
Test Cases
├── Test Definition [P1]
│   ├── Test name
│   ├── Input text
│   ├── Expected match or no match
│   ├── Expected captures
│   ├── Expected replacement
│   └── Optional description
│
├── Test Runner [P1]
│   ├── Run one test
│   ├── Run all tests
│   ├── Display pass/fail status
│   ├── Show expected versus actual
│   ├── Explain assertion failures
│   └── Filter failing tests
│
├── Regression Suites [P2]
│   ├── Group related tests
│   ├── Save test collections
│   ├── Rerun after pattern changes
│   └── Compare results between versions
│
├── Import & Export [P2]
│   ├── JSON test format
│   ├── Import existing cases
│   ├── Validate imported data
│   └── Export complete suites
│
└── Test Generation [P3]
    ├── Generate basic positive examples
    ├── Generate negative examples
    ├── Generate boundary cases
    └── Let developers edit generated tests
```

### Detailed requirements

- Expected results should be explicit.
- Test cases should record the intended regex engine and flags when relevant.
- Automatically generated tests are suggestions and must not be treated as exhaustive correctness proofs.
- Importing test suites must validate the file format and impose sensible size limits.

# 10. Learning Mode

Help developers learn regular expressions through interactive examples.

```
Learning Mode
├── Interactive Lessons [P2]
│   ├── Literals and escaping
│   ├── Character classes
│   ├── Quantifiers
│   ├── Groups and captures
│   ├── Alternation
│   ├── Anchors and boundaries
│   ├── Lookarounds
│   ├── Unicode
│   └── Greedy versus lazy matching
│
├── Interactive Examples [P2]
│   ├── Edit a pattern
│   ├── Edit input text
│   ├── Observe matching results
│   ├── Read token explanations
│   └── Compare alternative patterns
│
├── Challenges [P2]
│   ├── Predict the match
│   ├── Complete a pattern
│   ├── Find a syntax error
│   ├── Extract structured text
│   └── Optimize a problematic pattern
│
└── Hints & Feedback [P2]
    ├── Progressive hints
    ├── Explain incorrect answers
    ├── Show a valid solution
    └── Link back to the relevant lesson
```

### Detailed requirements

- Lessons should use small, focused examples.
- Each challenge should have a clear expected result.
- Explanations should account for the selected regex flavor.
- Progress tracking can remain local unless the user explicitly enables another storage mechanism.

# 11. Workspace & Sharing

Make it easy to save useful patterns and continue work later.

```
Workspace & Sharing
├── Local Persistence [P1]
│   ├── Autosave current pattern
│   ├── Autosave test input
│   ├── Remember flags
│   ├── Restore previous workspace
│   └── Clear saved workspace
│
├── Pattern Library [P2]
│   ├── Save named patterns
│   ├── Add descriptions
│   ├── Add tags
│   ├── Organize into folders
│   ├── Search saved patterns
│   └── Duplicate patterns
│
├── Import & Export [P1]
│   ├── Export a pattern
│   ├── Export workspace configuration
│   ├── Import saved patterns
│   └── Validate imported data
│
├── Sharing [P2]
│   ├── Generate shareable links
│   ├── Encode pattern and configuration
│   ├── Open shared workspace
│   ├── Copy pattern and results
│   └── Warn before sharing sensitive data
│
└── Privacy Controls [P1]
    ├── Clear local data
    ├── Explain what is saved
    ├── Explain what is shared
    └── Require explicit action for external sharing
```

### Detailed requirements

- The basic tool should work without requiring an account.
- Local persistence should have a clear reset option.
- A shareable URL may expose its encoded content to anyone who receives the URL and may appear in browser history or logs.
- Do not place secrets, private customer data, or sensitive test inputs into shared URLs.
- If cloud synchronization is added later, explain the storage and privacy model separately.

# 12. Developer Integration

Help developers move from experimentation to production code.

```
Developer Integration
├── Code Generation [P1]
│   ├── JavaScript snippet
│   ├── TypeScript snippet
│   ├── Selected engine syntax
│   ├── Example input and output
│   ├── Capture-group usage
│   └── Replacement example
│
├── Copy & Export [P1]
│   ├── Copy pattern
│   ├── Copy flags
│   ├── Copy complete regex literal
│   ├── Copy escaped string representation
│   └── Copy test cases
│
├── CLI [P3]
│   ├── Test patterns from files
│   ├── Run test suites
│   ├── Print matches and captures
│   └── Produce machine-readable output
│
├── CI Integration [P3]
│   ├── Run regex test suites in CI
│   ├── Return a non-zero exit code on failure
│   ├── Export JSON results
│   └── Integrate with common build workflows
│
└── Editor Integration [P3]
    ├── Editor extensions
    ├── Open pattern in RegExen
    ├── Copy generated code
    └── Import selected test cases
```

### Detailed requirements

- Generated snippets should be valid for the selected language and engine.
- String escaping and regex escaping must be handled separately.
- CLI and CI tools should use deterministic output formats.
- Integrations should not require users to upload proprietary source code to a remote service by default.

# 13. UX, Accessibility & Internationalization

Make the tool comfortable to use for different developers and devices.

```
UX & Accessibility
├── Responsive Layout [P0]
│   ├── Desktop layout
│   ├── Tablet layout
│   ├── Mobile layout
│   └── Touch-friendly controls
│
├── Themes [P1]
│   ├── Dark theme
│   ├── Light theme
│   ├── System preference
│   └── Persist selected theme
│
├── Accessibility [P1]
│   ├── Keyboard navigation
│   ├── Visible focus states
│   ├── Accessible labels
│   ├── Screen-reader-friendly results
│   ├── Sufficient contrast
│   └── Reduced-motion support
│
├── Editor Experience [P1]
│   ├── Helpful empty states
│   ├── Clear error messages
│   ├── Consistent panel behavior
│   ├── Loading and timeout states
│   └── Undo-friendly editing
│
└── Internationalization [P2]
    ├── English interface
    ├── Arabic interface
    ├── Right-to-left layout
    ├── Localized help text
    └── Keep regex syntax independent of UI language
```

### Detailed requirements

- Core functionality must remain usable with a keyboard.
- Color must not be the only way to distinguish match states.
- Reduced-motion preferences should be respected.
- Right-to-left support should not reverse regex syntax or corrupt code editing.
- Error messages should remain concise and actionable.

# 14. Privacy, Security & Reliability

Protect the user's browser and data while making the tool predictable.

```
Privacy & Reliability
├── Local-First Design [P1]
│   ├── Perform basic matching locally
│   ├── Avoid sending test input to a server by default
│   ├── Explain external integrations
│   └── Make network behavior transparent
│
├── Execution Safety [P1]
│   ├── Worker-based expensive operations
│   ├── Execution limits
│   ├── Input-size limits
│   ├── Trace-size limits
│   ├── Cancellation controls
│   └── Graceful recovery after failures
│
├── Input Validation [P1]
│   ├── Validate imported JSON
│   ├── Reject malformed workspace data
│   ├── Handle invalid patterns safely
│   └── Limit excessive imported content
│
├── Dependency & Browser Reliability [P1]
│   ├── Document browser requirements
│   ├── Test supported browsers
│   ├── Monitor dependency updates
│   └── Avoid unnecessary dependencies
│
└── Transparency [P1]
    ├── Document supported regex syntax
    ├── Document known limitations
    ├── Distinguish native results from simulations
    ├── Explain performance warnings
    └── Publish privacy documentation
```

### Detailed requirements

- Never evaluate arbitrary user-provided JavaScript as part of regex testing.
- Treat imported patterns, test cases, and shared content as untrusted input.
- Do not claim that a pattern is safe merely because static analysis finds no warning.
- If remote engines or APIs are added, disclose when data leaves the browser.
- Ensure errors and timeouts do not permanently freeze the interface.

# 15. Engineering Quality & Open Source

Build the project so that new features can be added without making the core unreliable.

```
Engineering Quality
├── Architecture [P1]
│   ├── Separate UI from regex execution
│   ├── Define engine adapter interfaces
│   ├── Separate parser from renderer
│   ├── Separate matching from visualization
│   └── Define feature-support metadata
│
├── Automated Testing [P1]
│   ├── Unit tests
│   ├── Parser tests
│   ├── Engine conformance tests
│   ├── Regression tests
│   ├── Unicode tests
│   ├── Zero-length match tests
│   └── Timeout and error tests
│
├── Performance Testing [P2]
│   ├── Large-input tests
│   ├── Large-pattern tests
│   ├── Trace memory tests
│   └── Performance regression tests
│
├── Documentation [P1]
│   ├── Installation guide
│   ├── User guide
│   ├── Feature documentation
│   ├── Supported syntax matrix
│   ├── Architecture overview
│   └── Troubleshooting guide
│
├── Open-Source Contribution [P1]
│   ├── Contribution guide
│   ├── Issue templates
│   ├── Pull request template
│   ├── Code of conduct
│   └── Development setup
│
└── Release Quality [P1]
    ├── Build validation
    ├── Automated tests in CI
    ├── Dependency checks
    ├── Versioned releases
    └── Changelog
```

# 16. Recommended MVP

Do not implement every feature before releasing the first version.

The first release should be small, reliable, and immediately useful.

```
RegExen MVP
├── Pattern Editor
│   ├── Enter a pattern
│   ├── Toggle supported flags
│   └── Display syntax errors
│
├── Test Input
│   ├── Enter multiline text
│   └── Highlight matching text
│
├── Match Results
│   ├── Show match count
│   ├── Show matched text
│   ├── Show indexes
│   └── Show capturing groups
│
├── Quick Reference
│   ├── Common syntax
│   ├── Quantifiers
│   ├── Groups
│   └── Flags
│
├── Basic UX
│   ├── Responsive layout
│   ├── Dark and light themes
│   └── Clear error states
│
└── Reliability
    ├── Local execution
    ├── Safe handling of invalid patterns
    └── Automated tests for matching edge cases
```

## MVP acceptance criteria

- Users can enter a regex and test it against text.
- Supported flags can be enabled and disabled.
- Matches are highlighted correctly.
- Capturing groups are displayed correctly.
- Invalid patterns produce useful error messages.
- Zero-length global matches are handled without infinite loops.
- The interface works on desktop and mobile.
- Basic functionality works without an account.
- Test inputs are not transmitted to a server by default.
- Core behavior is covered by automated tests.

# 17. Suggested Development Roadmap

## Phase 1 — Foundation

Goal: A reliable regex tester.

- Build the workspace layout.
- Implement the pattern editor.
- Add supported JavaScript flags.
- Implement matching and highlighting.
- Display captures and indexes.
- Add useful syntax errors.
- Add the quick reference.
- Write core automated tests.

## Phase 2 — Understanding

Goal: Explain patterns rather than merely execute them.

- Implement regex tokenization.
- Build an abstract syntax tree for supported syntax.
- Add token explanations.
- Display a hierarchical pattern tree.
- Add multiple test cases.
- Add replacement preview.
- Add JSON and CSV export.

## Phase 3 — Execution Visualization

Goal: Explain how matching decisions work.

- Define the supported interpreter syntax.
- Implement a dedicated interpreter for that subset.
- Record execution events.
- Add step-by-step navigation.
- Visualize groups and captures.
- Explain greedy and lazy matching.
- Add strict trace limits.
- Clearly label simulations and limitations.

## Phase 4 — Automata

Goal: Visualize the theoretical structure of supported patterns.

- Convert supported syntax into an NFA.
- Render states and transitions.
- Animate input processing.
- Highlight accepted and rejected paths.
- Add DFA conversion if useful.
- Add conversion limitations and warnings.

## Phase 5 — Advanced Diagnostics

Goal: Help developers avoid compatibility and performance problems.

- Add performance measurements in an isolated Worker.
- Add configurable time and input limits.
- Implement static performance heuristics.
- Add ReDoS education and warnings.
- Build an engine compatibility matrix.
- Add engine adapters where practical.
- Expand conformance and regression tests.

## Phase 6 — Ecosystem

Goal: Make RegExen useful beyond its web interface.

- Add pattern collections.
- Add import and export.
- Add shareable workspaces with privacy warnings.
- Generate code snippets.
- Develop a CLI if there is demand.
- Add CI integration.
- Explore editor integrations.

# 18. Priority Summary

| Priority | Meaning                  | Examples                                                    |
| -------- | ------------------------ | ----------------------------------------------------------- |
| P0       | Required for MVP         | Editor, flags, input, matching, highlighting                |
| P1       | Core product quality     | Captures, explanations, replacement, accessibility, testing |
| P2       | Advanced differentiation | Execution traces, automata, performance analysis            |
| P3       | Long-term expansion      | DFA minimization, CLI, CI, editor integrations              |

## Recommended focus

Build a complete, polished regex tester first. Then prioritize the features that make RegExen meaningfully different:

1. Understand: Explain the pattern as a syntax tree.
2. Visualize: Step through matching decisions using an explicitly documented interpreter.
3. Explore: Convert supported patterns into state machines.
4. Diagnose: Identify compatibility issues and potential performance risks.
5. Integrate: Export tests and code for real development workflows.

A smaller implementation with accurate results and clearly documented limitations is better than a large feature list with misleading explanations.

# 19. Definition of Done

A feature is ready when:

- Its behavior is documented.
- Its supported syntax and limitations are clear.
- It has automated tests for normal and edge cases.
- Invalid inputs produce useful errors.
- Expensive operations have appropriate limits.
- The interface remains responsive.
- Keyboard navigation and accessibility have been considered.
- Results are not mislabeled as coming from an engine that was not used.
- Examples and documentation are updated.
- No user input is transmitted unexpectedly.

# References

These resources can help guide implementation and validate behavior.

- [MDN — Regular expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions)
- [MDN — Regular expressions guide](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions)
- [MDN — Regular expressions cheat sheet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Cheatsheet)
- [regex101](https://regex101.com/)
- [regex101 documentation](https://docs.regex101.com/)
- [OWASP — Regular expression Denial of Service (ReDoS)](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)

RegExen principle: Make regular expressions easier to write, easier to understand, and safer to use.
