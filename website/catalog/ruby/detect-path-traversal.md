## Detect Path Traversal Vulnerability in Rails

* [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InJ1YnkiLCJxdWVyeSI6IiIsInJld3JpdGUiOiIiLCJzdHJpY3RuZXNzIjoiYXN0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiJpZDogcGF0aC10cmF2ZXJzYWxcbm1lc3NhZ2U6IFBvdGVudGlhbCBQYXRoIFRyYXZlcnNhbCB2dWxuZXJhYmlsaXR5IGRldGVjdGVkLiBVc2VyIGlucHV0IGlzIGJlaW5nIHVzZWQgdG8gY29uc3RydWN0IGZpbGUgcGF0aHMgd2l0aG91dCB2YWxpZGF0aW9uLlxuc2V2ZXJpdHk6IGhpbnRcbmxhbmd1YWdlOiBSdWJ5XG5ub3RlOiB8XG4gIFBhdGggVHJhdmVyc2FsIChEaXJlY3RvcnkgVHJhdmVyc2FsKSBvY2N1cnMgd2hlbiB1c2VyIGlucHV0IGlzIHVzZWQgdG8gY29uc3RydWN0IGZpbGUgcGF0aHNcbiAgd2l0aG91dCBwcm9wZXIgdmFsaWRhdGlvbi4gVGhpcyBhbGxvd3MgYXR0YWNrZXJzIHRvIGFjY2VzcyBmaWxlcyBvdXRzaWRlIHRoZSBpbnRlbmRlZCBkaXJlY3RvcnkuXG4gIFZhbGlkYXRlIGFuZCBzYW5pdGl6ZSBmaWxlIHBhdGhzLCBhbmQgdXNlIEZpbGUuYmFzZW5hbWUoKSBvciBzaW1pbGFyIGZ1bmN0aW9ucy5cblxucnVsZTpcbiAgYW55OlxuICAgIC0gcGF0dGVybjogUmFpbHMucm9vdC5qb2luKCQkJCwgJFZBUiwgJCQkKVxuICAgIC0gcGF0dGVybjogRmlsZS5qb2luKCQkJCwgJFZBUiwgJCQkKVxuICAgIC0gcGF0dGVybjogc2VuZF9maWxlICRWQVIiLCJzb3VyY2UiOiIjIOaknOWHuuOBleOCjOOCi+OCs+ODvOODieS+i1xuIyDjg5Hjgr/jg7zjg7MxOiBSYWlscy5yb290LmpvaW4gd2l0aCB2YXJpYWJsZVxuUmFpbHMucm9vdC5qb2luKCd1cGxvYWRzJywgcGFyYW1zWzpmaWxlbmFtZV0pXG5SYWlscy5yb290LmpvaW4oJ2RhdGEnLCB1c2VyX2lucHV0LCAnZmlsZS50eHQnKVxuXG4jIOODkeOCv+ODvOODszI6IEZpbGUuam9pbiB3aXRoIHZhcmlhYmxlXG5GaWxlLmpvaW4oJy92YXIvd3d3JywgcGFyYW1zWzpwYXRoXSlcbkZpbGUuam9pbihiYXNlX3BhdGgsIHVzZXJfaWQsIGZpbGVuYW1lKVxuXG4jIOODkeOCv+ODvOODszM6IHNlbmRfZmlsZSB3aXRoIHZhcmlhYmxlXG5zZW5kX2ZpbGUgcGFyYW1zWzpmaWxlXVxuc2VuZF9maWxlIHVzZXIuZG9jdW1lbnRfcGF0aCJ9)

### Description

Path Traversal (Directory Traversal) occurs when user input is used to construct file paths without proper validation. This allows attackers to access files outside the intended directory by using special characters like `../` to navigate the filesystem.

This rule detects common path traversal patterns in Rails applications where user-controlled variables are used in:
- `Rails.root.join()` - Building file paths relative to the Rails application root
- `File.join()` - Constructing file paths
- `send_file` - Sending files to users

To prevent path traversal vulnerabilities, always validate and sanitize file paths, use `File.basename()` to extract only the filename, or use allowlists for permitted files.

### YAML
```yaml
id: path-traversal
message: Potential Path Traversal vulnerability detected. User input is being used to construct file paths without validation.
severity: hint
language: Ruby
note: |
  Path Traversal (Directory Traversal) occurs when user input is used to construct file paths
  without proper validation. This allows attackers to access files outside the intended directory.
  Validate and sanitize file paths, and use File.basename() or similar functions.

rule:
  any:
    - pattern: Rails.root.join($$$, $VAR, $$$)
    - pattern: File.join($$$, $VAR, $$$)
    - pattern: send_file $VAR
```

### Example

```rb {2,3,6,7,10,11}
# Pattern 1: Rails.root.join with variable
Rails.root.join('uploads', params[:filename])
Rails.root.join('data', user_input, 'file.txt')

# Pattern 2: File.join with variable
File.join('/var/www', params[:path])
File.join(base_path, user_id, filename)

# Pattern 3: send_file with variable
send_file params[:file]
send_file user.document_path
```

### Contributed by
[sora fs0414](https://x.com/_fs0414) from this [blog post](https://fs0414.hatenablog.com/entry/2025/11/02/032114)
