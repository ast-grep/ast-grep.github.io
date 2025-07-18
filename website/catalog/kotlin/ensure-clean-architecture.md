<!-- Remove Badge if it does not have fix-->

## Ensure Clean Architecture

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImtvdGxpbiIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJyZWxheGVkIiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogaW1wb3J0LWRlcGVuZGVuY3ktdmlvbGF0aW9uXG5tZXNzYWdlOiBJbXBvcnQgRGVwZW5kZW5jeSBWaW9sYXRpb24gXG5ub3RlczogRW5zdXJlcyB0aGF0IGltcG9ydHMgY29tcGx5IHdpdGggYXJjaGl0ZWN0dXJhbCBydWxlcy4gXG5zZXZlcml0eTogZXJyb3JcbnJ1bGU6XG4gIHBhdHRlcm46IGltcG9ydCAkUEFUSFxuY29uc3RyYWludHM6XG4gIFBBVEg6XG4gICAgYW55OlxuICAgIC0gcmVnZXg6IGNvbVxcLmV4YW1wbGUoXFwuXFx3KykqXFwuZGF0YVxuICAgIC0gcmVnZXg6IGNvbVxcLmV4YW1wbGUoXFwuXFx3KykqXFwucHJlc2VudGF0aW9uXG5maWxlczpcbi0gY29tL2V4YW1wbGUvZG9tYWluLyoqLyoua3QiLCJzb3VyY2UiOiJpbXBvcnQgYW5kcm9pZHgubGlmZWN5Y2xlLlZpZXdNb2RlbFxuaW1wb3J0IGFuZHJvaWR4LmxpZmVjeWNsZS5WaWV3TW9kZWxTY29wZVxuaW1wb3J0IGNvbS5leGFtcGxlLmN1c3RvbWxpbnRleGFtcGxlLmRhdGEubW9kZWxzLlVzZXJEdG9cbmltcG9ydCBjb20uZXhhbXBsZS5jdXN0b21saW50ZXhhbXBsZS5kb21haW4udXNlY2FzZXMuR2V0VXNlclVzZUNhc2VcbmltcG9ydCBjb20uZXhhbXBsZS5jdXN0b21saW50ZXhhbXBsZS5wcmVzZW50YXRpb24uc3RhdGVzLk1haW5TdGF0ZVxuaW1wb3J0IGRhZ2dlci5oaWx0LmFuZHJvaWQubGlmZWN5Y2xlLkhpbHRWaWV3TW9kZWwifQ==)

### Description

This ast-grep rule ensures that the **domain** package in a [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) project does not import classes from the **data** or **presentation** packages. It enforces the separation of concerns by preventing the domain layer from depending on other layers, maintaining the integrity of the architecture.

For example, the rule will trigger an error if an import statement like `import com.example.data.SomeClass` or `import com.example.presentation.AnotherClass` is found within the domain package.

The rule uses the [`files`](/reference/yaml.html#files) field to apply only to the domain package.

### YAML

```yaml
id: import-dependency-violation
message: Import Dependency Violation
notes: Ensures that imports comply with architectural rules.
severity: error
rule:
  pattern: import $PATH # capture the import statement
constraints:
  PATH: # find specific package imports
    any:
      - regex: com\.example(\.\w+)*\.data
      - regex: com\.example(\.\w+)*\.presentation
files: # apply only to domain package
  - com/example/domain/**/*.kt
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```kotlin {3,5}
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelScope
import com.example.customlintexample.data.models.UserDto
import com.example.customlintexample.domain.usecases.GetUserUseCase
import com.example.customlintexample.presentation.states.MainState
import dagger.hilt.android.lifecycle.HiltViewModel
```

### Contributed by

Inspired by the post [Custom Lint Task Configuration in Gradle with Kotlin DSL](https://www.sngular.com/insights/320/custom-lint-task-configuration-in-gradle-with-kotlin-dsl)
