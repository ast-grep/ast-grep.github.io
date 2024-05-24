## Migrate OpenAI SDK <Badge type="tip" text="Has Fix" />

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InB5dGhvbiIsInF1ZXJ5IjoiZGVmICRGVU5DKCQkJEFSR1MpOiAkJCRCT0RZIiwicmV3cml0ZSI6IiIsImNvbmZpZyI6InJ1bGU6XG4gIHBhdHRlcm46IGltcG9ydCBvcGVuYWlcbmZpeDogZnJvbSBvcGVuYWkgaW1wb3J0IENsaWVudFxuLS0tXG5ydWxlOlxuICBwYXR0ZXJuOiBvcGVuYWkuYXBpX2tleSA9ICRLRVlcbmZpeDogY2xpZW50ID0gQ2xpZW50KCRLRVkpXG4tLS1cbnJ1bGU6XG4gIHBhdHRlcm46IG9wZW5haS5Db21wbGV0aW9uLmNyZWF0ZSgkJCRBUkdTKVxuZml4OiB8LVxuICBjbGllbnQuY29tcGxldGlvbnMuY3JlYXRlKFxuICAgICQkJEFSR1NcbiAgKSIsInNvdXJjZSI6ImltcG9ydCBvc1xuaW1wb3J0IG9wZW5haVxuZnJvbSBmbGFzayBpbXBvcnQgRmxhc2ssIGpzb25pZnlcblxuYXBwID0gRmxhc2soX19uYW1lX18pXG5vcGVuYWkuYXBpX2tleSA9IG9zLmdldGVudihcIk9QRU5BSV9BUElfS0VZXCIpXG5cblxuQGFwcC5yb3V0ZShcIi9jaGF0XCIsIG1ldGhvZHM9KFwiUE9TVFwiKSlcbmRlZiBpbmRleCgpOlxuICAgIGFuaW1hbCA9IHJlcXVlc3QuZm9ybVtcImFuaW1hbFwiXVxuICAgIHJlc3BvbnNlID0gb3BlbmFpLkNvbXBsZXRpb24uY3JlYXRlKFxuICAgICAgICBtb2RlbD1cInRleHQtZGF2aW5jaS0wMDNcIixcbiAgICAgICAgcHJvbXB0PWdlbmVyYXRlX3Byb21wdChhbmltYWwpLFxuICAgICAgICB0ZW1wZXJhdHVyZT0wLjYsXG4gICAgKVxuICAgIHJldHVybiBqc29uaWZ5KHJlc3BvbnNlLmNob2ljZXMpIn0=)

### Description

OpenAI has introduced some breaking changes in their API, such as using `Client` to initialize the service and renaming the `Completion` method to `completions` . This example shows how to use ast-grep to automatically update your code to the new API.

API migration requires multiple related rules to work together.
The example shows how to write [multiple rules](/reference/playground.html#test-multiple-rules) in a [single YAML](/guide/rewrite-code.html#using-fix-in-yaml-rule) file.
The rules and patterns in the example are simple and self-explanatory, so we will not explain them further.

### YAML

```yaml
id: import-openai
language: python
rule:
  pattern: import openai
fix: from openai import Client
---
id: rewrite-client
language: python
rule:
  pattern: openai.api_key = $KEY
fix: client = Client($KEY)
---
id: rewrite-chat-completion
language: python
rule:
  pattern: openai.Completion.create($$$ARGS)
fix: |-
  client.completions.create(
    $$$ARGS
  )
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->
```python {2,6,11-15}
import os
import openai
from flask import Flask, jsonify

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/chat", methods=("POST"))
def index():
    animal = request.form["animal"]
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=generate_prompt(animal),
        temperature=0.6,
    )
    return jsonify(response.choices)
```

### Diff
<!-- use # [!code --] and # [!code ++] to annotate diff -->
```python
import os
import openai # [!code --]
from openai import Client # [!code ++]
from flask import Flask, jsonify

app = Flask(__name__)
openai.api_key = os.getenv("OPENAI_API_KEY") # [!code --]
client = Client(os.getenv("OPENAI_API_KEY")) # [!code ++]

@app.route("/chat", methods=("POST"))
def index():
    animal = request.form["animal"]
    response = openai.Completion.create( # [!code --]
    response = client.completions.create( # [!code ++]
      model="text-davinci-003",
      prompt=generate_prompt(animal),
      temperature=0.6,
    )
    return jsonify(response.choices)
```

### Contributed by
[Herrington Darkholme](https://twitter.com/hd_nvim), inspired by [Morgante](https://twitter.com/morgantepell/status/1721668781246750952) from [grit.io](https://www.grit.io/)
