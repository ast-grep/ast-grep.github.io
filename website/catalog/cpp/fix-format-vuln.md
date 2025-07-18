<!-- Remove Badge if it does not have fix-->

## Fix Format String Vulnerability <Badge type="tip" text="Has Fix" />

- [Playground Link](/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6ImNwcCIsInF1ZXJ5IjoiIiwicmV3cml0ZSI6IiIsInN0cmljdG5lc3MiOiJzbWFydCIsInNlbGVjdG9yIjoiIiwiY29uZmlnIjoiaWQ6IGZpeC1mb3JtYXQtc2VjdXJpdHktZXJyb3Jcbmxhbmd1YWdlOiBDcHBcbnJ1bGU6XG4gIHBhdHRlcm46ICRQUklOVEYoJFMsICRWQVIpXG5jb25zdHJhaW50czpcbiAgUFJJTlRGOiAjIGEgZm9ybWF0IHN0cmluZyBmdW5jdGlvblxuICAgIHsgcmVnZXg6IFwiXnNwcmludGZ8ZnByaW50ZiRcIiB9XG4gIFZBUjogIyBub3QgYSBsaXRlcmFsIHN0cmluZ1xuICAgIG5vdDpcbiAgICAgIGFueTpcbiAgICAgIC0geyBraW5kOiBzdHJpbmdfbGl0ZXJhbCB9XG4gICAgICAtIHsga2luZDogY29uY2F0ZW5hdGVkX3N0cmluZyB9XG5maXg6ICRQUklOVEYoJFMsIFwiJXNcIiwgJFZBUilcbiIsInNvdXJjZSI6Ii8vIEVycm9yXG5mcHJpbnRmKHN0ZGVyciwgb3V0KTtcbnNwcmludGYoJmJ1ZmZlclsyXSwgb2JqLT5UZXh0KTtcbnNwcmludGYoYnVmMSwgVGV4dF9TdHJpbmcoVFhUX1dBSVRJTkdfRk9SX0NPTk5FQ1RJT05TKSk7XG4vLyBPS1xuZnByaW50ZihzdGRlcnIsIFwiJXNcIiwgb3V0KTtcbnNwcmludGYoJmJ1ZmZlclsyXSwgXCIlc1wiLCBvYmotPlRleHQpO1xuc3ByaW50ZihidWYxLCBcIiVzXCIsIFRleHRfU3RyaW5nKFRYVF9XQUlUSU5HX0ZPUl9DT05ORUNUSU9OUykpOyJ9)

### Description

The [Format String exploit](https://owasp.org/www-community/attacks/Format_string_attack) occurs when the submitted data of an input string is evaluated as a command by the application.

For example, using `sprintf(s, var)` can lead to format string vulnerabilities if `var` contains user-controlled data. This can be exploited to execute arbitrary code. By explicitly specifying the format string as `"%s"`, you ensure that `var` is treated as a string, mitigating this risk.

<!-- Use YAML in the example. Delete this section if use pattern. -->

### YAML

```yaml
id: fix-format-security-error
language: Cpp
rule:
  pattern: $PRINTF($S, $VAR)
constraints:
  PRINTF: # a format string function
    { regex: "^sprintf|fprintf$" }
  VAR: # not a literal string
    not:
      any:
        - { kind: string_literal }
        - { kind: concatenated_string }
fix: $PRINTF($S, "%s", $VAR)
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```cpp {2-4}
// Error
fprintf(stderr, out);
sprintf(&buffer[2], obj->Text);
sprintf(buf1, Text_String(TXT_WAITING_FOR_CONNECTIONS));
// OK
fprintf(stderr, "%s", out);
sprintf(&buffer[2], "%s", obj->Text);
sprintf(buf1, "%s", Text_String(TXT_WAITING_FOR_CONNECTIONS));
```

### Diff

<!-- use // [!code --] and // [!code ++] to annotate diff -->

```js
// Error
fprintf(stderr, out); // [!code --]
fprintf(stderr, "%s", out); // [!code ++]
sprintf(&buffer[2], obj->Text); // [!code --]
sprintf(&buffer[2], "%s", obj->Text); // [!code ++]
sprintf(buf1, Text_String(TXT_WAITING_FOR_CONNECTIONS)); // [!code --]
sprintf(buf1, "%s", Text_String(TXT_WAITING_FOR_CONNECTIONS)); // [!code ++]
// OK
fprintf(stderr, "%s", out);
sprintf(&buffer[2], "%s", obj->Text);
sprintf(buf1, "%s", Text_String(TXT_WAITING_FOR_CONNECTIONS));
```

### Contributed by

[xiaoxiangmoe](https://github.com/xiaoxiangmoe)
