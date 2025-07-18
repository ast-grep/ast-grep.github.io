## Find Import Identifiers

- [Playground Link](https://ast-grep.github.io/playground.html#eyJtb2RlIjoiQ29uZmlnIiwibGFuZyI6InR5cGVzY3JpcHQiLCJxdWVyeSI6ImNvbnNvbGUubG9nKCRNQVRDSCkiLCJyZXdyaXRlIjoibG9nZ2VyLmxvZygkTUFUQ0gpIiwic3RyaWN0bmVzcyI6InNtYXJ0Iiwic2VsZWN0b3IiOiIiLCJjb25maWciOiIjIGZpbmQtYWxsLWltcG9ydHMtYW5kLXJlcXVpcmVzLnlhbWxcbmlkOiBmaW5kLWFsbC1pbXBvcnRzLWFuZC1yZXF1aXJlc1xubGFuZ3VhZ2U6IFR5cGVTY3JpcHRcbm1lc3NhZ2U6IEZvdW5kIG1vZHVsZSBpbXBvcnQgb3IgcmVxdWlyZS5cbnNldmVyaXR5OiBpbmZvXG5ydWxlOlxuICBhbnk6XG4gICAgIyBBTElBUyBJTVBPUlRTXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjIGltcG9ydCB7IE9SSUdJTkFMIGFzIEFMSUFTIH0gZnJvbSAnU09VUkNFJ1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLSBhbGw6XG4gICAgICAgICMgMS4gVGFyZ2V0IHRoZSBzcGVjaWZpYyBub2RlIHR5cGUgZm9yIG5hbWVkIGltcG9ydHNcbiAgICAgICAgLSBraW5kOiBpbXBvcnRfc3BlY2lmaWVyXG4gICAgICAgICMgMi4gRW5zdXJlIGl0ICpoYXMqIGFuICdhbGlhcycgZmllbGQsIGNhcHR1cmluZyB0aGUgYWxpYXMgaWRlbnRpZmllclxuICAgICAgICAtIGhhczpcbiAgICAgICAgICAgIGZpZWxkOiBhbGlhc1xuICAgICAgICAgICAgcGF0dGVybjogJEFMSUFTXG4gICAgICAgICMgMy4gQ2FwdHVyZSB0aGUgb3JpZ2luYWwgaWRlbnRpZmllciAod2hpY2ggaGFzIHRoZSAnbmFtZScgZmllbGQpXG4gICAgICAgIC0gaGFzOlxuICAgICAgICAgICAgZmllbGQ6IG5hbWVcbiAgICAgICAgICAgIHBhdHRlcm46ICRPUklHSU5BTFxuICAgICAgICAjIDQuIEZpbmQgYW4gQU5DRVNUT1IgaW1wb3J0X3N0YXRlbWVudCBhbmQgY2FwdHVyZSBpdHMgc291cmNlIHBhdGhcbiAgICAgICAgLSBpbnNpZGU6XG4gICAgICAgICAgICBzdG9wQnk6IGVuZCAjIDw8PC0tLSBUaGlzIGlzIHRoZSBrZXkgZml4ISBTZWFyY2ggYW5jZXN0b3JzLlxuICAgICAgICAgICAga2luZDogaW1wb3J0X3N0YXRlbWVudFxuICAgICAgICAgICAgaGFzOiAjIEVuc3VyZSB0aGUgZm91bmQgaW1wb3J0X3N0YXRlbWVudCBoYXMgdGhlIHNvdXJjZSBmaWVsZFxuICAgICAgICAgICAgICBmaWVsZDogc291cmNlXG4gICAgICAgICAgICAgIHBhdHRlcm46ICRTT1VSQ0VcblxuICAgICMgREVGQVVMVCBJTVBPUlRTXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjIGltcG9ydCB7IE9SSUdJTkFMIH0gZnJvbSAnU09VUkNFJ1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLSBhbGw6XG4gICAgICAgIC0ga2luZDogaW1wb3J0X3N0YXRlbWVudFxuICAgICAgICAtIGhhczpcbiAgICAgICAgICAgICMgRW5zdXJlIGl0IGhhcyBhbiBpbXBvcnRfY2xhdXNlLi4uXG4gICAgICAgICAgICBraW5kOiBpbXBvcnRfY2xhdXNlXG4gICAgICAgICAgICBoYXM6XG4gICAgICAgICAgICAgICMgLi4udGhhdCBkaXJlY3RseSBjb250YWlucyBhbiBpZGVudGlmaWVyICh0aGUgZGVmYXVsdCBpbXBvcnQgbmFtZSlcbiAgICAgICAgICAgICAgIyBUaGlzIGlkZW50aWZpZXIgaXMgTk9UIHVuZGVyIGEgJ25hbWVkX2ltcG9ydHMnIG9yICduYW1lc3BhY2VfaW1wb3J0JyBub2RlXG4gICAgICAgICAgICAgIGtpbmQ6IGlkZW50aWZpZXJcbiAgICAgICAgICAgICAgcGF0dGVybjogJERFRkFVTFRfTkFNRVxuICAgICAgICAtIGhhczpcbiAgICAgICAgICAgIGZpZWxkOiBzb3VyY2VcbiAgICAgICAgICAgIHBhdHRlcm46ICRTT1VSQ0VcbiAgICBcbiAgICAjIFJFR1VMQVIgSU1QT1JUU1xuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyBpbXBvcnQgeyBPUklHSU5BTCB9IGZyb20gJ1NPVVJDRSdcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC0gYWxsOlxuICAgICAgICAjIDEuIFRhcmdldCB0aGUgc3BlY2lmaWMgbm9kZSB0eXBlIGZvciBuYW1lZCBpbXBvcnRzXG4gICAgICAgIC0ga2luZDogaW1wb3J0X3NwZWNpZmllclxuICAgICAgICAjIDIuIEVuc3VyZSBpdCAqaGFzKiBhbiAnYWxpYXMnIGZpZWxkLCBjYXB0dXJpbmcgdGhlIGFsaWFzIGlkZW50aWZpZXJcbiAgICAgICAgLSBoYXM6XG4gICAgICAgICAgICBmaWVsZDogbmFtZVxuICAgICAgICAgICAgcGF0dGVybjogJE9SSUdJTkFMXG4gICAgICAgICMgNC4gRmluZCBhbiBBTkNFU1RPUiBpbXBvcnRfc3RhdGVtZW50IGFuZCBjYXB0dXJlIGl0cyBzb3VyY2UgcGF0aFxuICAgICAgICAtIGluc2lkZTpcbiAgICAgICAgICAgIHN0b3BCeTogZW5kICMgPDw8LS0tIFRoaXMgaXMgdGhlIGtleSBmaXghIFNlYXJjaCBhbmNlc3RvcnMuXG4gICAgICAgICAgICBraW5kOiBpbXBvcnRfc3RhdGVtZW50XG4gICAgICAgICAgICBoYXM6ICMgRW5zdXJlIHRoZSBmb3VuZCBpbXBvcnRfc3RhdGVtZW50IGhhcyB0aGUgc291cmNlIGZpZWxkXG4gICAgICAgICAgICAgIGZpZWxkOiBzb3VyY2VcbiAgICAgICAgICAgICAgcGF0dGVybjogJFNPVVJDRVxuXG4gICAgIyBEWU5BTUlDIElNUE9SVFMgKFNpbmdsZSBWYXJpYWJsZSBBc3NpZ25tZW50KSBcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgZWc6IChjb25zdCBWQVJfTkFNRSA9IHJlcXVpcmUoJ1NPVVJDRScpKVxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLSBhbGw6XG4gICAgICAgIC0ga2luZDogdmFyaWFibGVfZGVjbGFyYXRvclxuICAgICAgICAtIGhhczpcbiAgICAgICAgICAgIGZpZWxkOiBuYW1lXG4gICAgICAgICAgICBraW5kOiBpZGVudGlmaWVyXG4gICAgICAgICAgICBwYXR0ZXJuOiAkVkFSX05BTUUgIyBDYXB0dXJlIHRoZSBzaW5nbGUgdmFyaWFibGUgbmFtZVxuICAgICAgICAtIGhhczpcbiAgICAgICAgICAgIGZpZWxkOiB2YWx1ZVxuICAgICAgICAgICAgYW55OlxuICAgICAgICAgICAgICAjIERpcmVjdCBjYWxsXG4gICAgICAgICAgICAgIC0gYWxsOiAjIFdyYXAgY29uZGl0aW9ucyBpbiBhbGxcbiAgICAgICAgICAgICAgICAgIC0ga2luZDogY2FsbF9leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAtIGhhczogeyBmaWVsZDogZnVuY3Rpb24sIHJlZ2V4OiAnXihyZXF1aXJlfGltcG9ydCkkJyB9XG4gICAgICAgICAgICAgICAgICAtIGhhczogeyBmaWVsZDogYXJndW1lbnRzLCBoYXM6IHsga2luZDogc3RyaW5nLCBwYXR0ZXJuOiAkU09VUkNFIH0gfSAjIENhcHR1cmUgc291cmNlXG4gICAgICAgICAgICAgICMgQXdhaXRlZCBjYWxsXG4gICAgICAgICAgICAgIC0ga2luZDogYXdhaXRfZXhwcmVzc2lvblxuICAgICAgICAgICAgICAgIGhhczpcbiAgICAgICAgICAgICAgICAgIGFsbDogIyBXcmFwIGNvbmRpdGlvbnMgaW4gYWxsXG4gICAgICAgICAgICAgICAgICAgIC0ga2luZDogY2FsbF9leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgIC0gaGFzOiB7IGZpZWxkOiBmdW5jdGlvbiwgcmVnZXg6ICdeKHJlcXVpcmV8aW1wb3J0KSQnIH1cbiAgICAgICAgICAgICAgICAgICAgLSBoYXM6IHsgZmllbGQ6IGFyZ3VtZW50cywgaGFzOiB7IGtpbmQ6IHN0cmluZywgcGF0dGVybjogJFNPVVJDRSB9IH0gIyBDYXB0dXJlIHNvdXJjZVxuXG4gICAgIyBEWU5BTUlDIElNUE9SVFMgKERlc3RydWN0dXJlZCBTaG9ydGhhbmQgQXNzaWdubWVudCkgICAgIFxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyBlZzogKGNvbnN0IHsgT1JJR0lOQUwgfSA9IHJlcXVpcmUoJ1NPVVJDRScpKVxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLSBhbGw6XG4gICAgICAgICMgMS4gVGFyZ2V0IHRoZSBzaG9ydGhhbmQgaWRlbnRpZmllciB3aXRoaW4gdGhlIHBhdHRlcm5cbiAgICAgICAgLSBraW5kOiBzaG9ydGhhbmRfcHJvcGVydHlfaWRlbnRpZmllcl9wYXR0ZXJuXG4gICAgICAgIC0gcGF0dGVybjogJE9SSUdJTkFMXG4gICAgICAgICMgMi4gRW5zdXJlIGl0J3MgaW5zaWRlIGFuIG9iamVjdF9wYXR0ZXJuIHRoYXQgaXMgdGhlIG5hbWUgb2YgYSB2YXJpYWJsZV9kZWNsYXJhdG9yXG4gICAgICAgIC0gaW5zaWRlOlxuICAgICAgICAgICAga2luZDogb2JqZWN0X3BhdHRlcm5cbiAgICAgICAgICAgIGluc2lkZTogIyBDaGVjayB0aGUgdmFyaWFibGVfZGVjbGFyYXRvciBpdCBiZWxvbmdzIHRvXG4gICAgICAgICAgICAgIGtpbmQ6IHZhcmlhYmxlX2RlY2xhcmF0b3JcbiAgICAgICAgICAgICAgIyAzLiBDaGVjayB0aGUgdmFsdWUgYXNzaWduZWQgYnkgdGhlIHZhcmlhYmxlX2RlY2xhcmF0b3JcbiAgICAgICAgICAgICAgaGFzOlxuICAgICAgICAgICAgICAgIGZpZWxkOiB2YWx1ZVxuICAgICAgICAgICAgICAgIGFueTpcbiAgICAgICAgICAgICAgICAgICMgRGlyZWN0IGNhbGxcbiAgICAgICAgICAgICAgICAgIC0gYWxsOlxuICAgICAgICAgICAgICAgICAgICAgIC0ga2luZDogY2FsbF9leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgLSBoYXM6IHsgZmllbGQ6IGZ1bmN0aW9uLCByZWdleDogJ14ocmVxdWlyZXxpbXBvcnQpJCcgfVxuICAgICAgICAgICAgICAgICAgICAgIC0gaGFzOiB7IGZpZWxkOiBhcmd1bWVudHMsIGhhczogeyBraW5kOiBzdHJpbmcsIHBhdHRlcm46ICRTT1VSQ0UgfSB9ICMgQ2FwdHVyZSBzb3VyY2VcbiAgICAgICAgICAgICAgICAgICMgQXdhaXRlZCBjYWxsXG4gICAgICAgICAgICAgICAgICAtIGtpbmQ6IGF3YWl0X2V4cHJlc3Npb25cbiAgICAgICAgICAgICAgICAgICAgaGFzOlxuICAgICAgICAgICAgICAgICAgICAgIGFsbDpcbiAgICAgICAgICAgICAgICAgICAgICAgIC0ga2luZDogY2FsbF9leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgICAgICAtIGhhczogeyBmaWVsZDogZnVuY3Rpb24sIHJlZ2V4OiAnXihyZXF1aXJlfGltcG9ydCkkJyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAtIGhhczogeyBmaWVsZDogYXJndW1lbnRzLCBoYXM6IHsga2luZDogc3RyaW5nLCBwYXR0ZXJuOiAkU09VUkNFIH0gfSAjIENhcHR1cmUgc291cmNlXG4gICAgICAgICAgICAgIHN0b3BCeTogZW5kICMgU2VhcmNoIGFuY2VzdG9ycyB0byBmaW5kIHRoZSBjb3JyZWN0IHZhcmlhYmxlX2RlY2xhcmF0b3JcblxuICAgICMgRFlOQU1JQyBJTVBPUlRTIChEZXN0cnVjdHVyZWQgQWxpYXMgQXNzaWdubWVudCkgXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjIGVnOiAoY29uc3QgeyBPUklHSU5BTDogQUxJQVMgfSA9IHJlcXVpcmUoJ1NPVVJDRScpKVxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLSBhbGw6XG4gICAgICAgICMgMS4gVGFyZ2V0IHRoZSBwYWlyX3BhdHRlcm4gZm9yIGFsaWFzZWQgZGVzdHJ1Y3R1cmluZ1xuICAgICAgICAtIGtpbmQ6IHBhaXJfcGF0dGVyblxuICAgICAgICAjIDIuIENhcHR1cmUgdGhlIG9yaWdpbmFsIGlkZW50aWZpZXIgKGtleSlcbiAgICAgICAgLSBoYXM6XG4gICAgICAgICAgICBmaWVsZDoga2V5XG4gICAgICAgICAgICBraW5kOiBwcm9wZXJ0eV9pZGVudGlmaWVyICMgQ291bGQgYmUgc3RyaW5nL251bWJlciBsaXRlcmFsIHRvbywgYnV0IHByb3BlcnR5X2lkZW50aWZpZXIgaXMgY29tbW9uXG4gICAgICAgICAgICBwYXR0ZXJuOiAkT1JJR0lOQUxcbiAgICAgICAgIyAzLiBDYXB0dXJlIHRoZSBhbGlhcyBpZGVudGlmaWVyICh2YWx1ZSlcbiAgICAgICAgLSBoYXM6XG4gICAgICAgICAgICBmaWVsZDogdmFsdWVcbiAgICAgICAgICAgIGtpbmQ6IGlkZW50aWZpZXJcbiAgICAgICAgICAgIHBhdHRlcm46ICRBTElBU1xuICAgICAgICAjIDQuIEVuc3VyZSBpdCdzIGluc2lkZSBhbiBvYmplY3RfcGF0dGVybiB0aGF0IGlzIHRoZSBuYW1lIG9mIGEgdmFyaWFibGVfZGVjbGFyYXRvclxuICAgICAgICAtIGluc2lkZTpcbiAgICAgICAgICAgIGtpbmQ6IG9iamVjdF9wYXR0ZXJuXG4gICAgICAgICAgICBpbnNpZGU6ICMgQ2hlY2sgdGhlIHZhcmlhYmxlX2RlY2xhcmF0b3IgaXQgYmVsb25ncyB0b1xuICAgICAgICAgICAgICBraW5kOiB2YXJpYWJsZV9kZWNsYXJhdG9yXG4gICAgICAgICAgICAgICMgNS4gQ2hlY2sgdGhlIHZhbHVlIGFzc2lnbmVkIGJ5IHRoZSB2YXJpYWJsZV9kZWNsYXJhdG9yXG4gICAgICAgICAgICAgIGhhczpcbiAgICAgICAgICAgICAgICBmaWVsZDogdmFsdWVcbiAgICAgICAgICAgICAgICBhbnk6XG4gICAgICAgICAgICAgICAgICAjIERpcmVjdCBjYWxsXG4gICAgICAgICAgICAgICAgICAtIGFsbDpcbiAgICAgICAgICAgICAgICAgICAgICAtIGtpbmQ6IGNhbGxfZXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICAgIC0gaGFzOiB7IGZpZWxkOiBmdW5jdGlvbiwgcmVnZXg6ICdeKHJlcXVpcmV8aW1wb3J0KSQnIH1cbiAgICAgICAgICAgICAgICAgICAgICAtIGhhczogeyBmaWVsZDogYXJndW1lbnRzLCBoYXM6IHsga2luZDogc3RyaW5nLCBwYXR0ZXJuOiAkU09VUkNFIH0gfSAjIENhcHR1cmUgc291cmNlXG4gICAgICAgICAgICAgICAgICAjIEF3YWl0ZWQgY2FsbFxuICAgICAgICAgICAgICAgICAgLSBraW5kOiBhd2FpdF9leHByZXNzaW9uXG4gICAgICAgICAgICAgICAgICAgIGhhczpcbiAgICAgICAgICAgICAgICAgICAgICBhbGw6XG4gICAgICAgICAgICAgICAgICAgICAgICAtIGtpbmQ6IGNhbGxfZXhwcmVzc2lvblxuICAgICAgICAgICAgICAgICAgICAgICAgLSBoYXM6IHsgZmllbGQ6IGZ1bmN0aW9uLCByZWdleDogJ14ocmVxdWlyZXxpbXBvcnQpJCcgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLSBoYXM6IHsgZmllbGQ6IGFyZ3VtZW50cywgaGFzOiB7IGtpbmQ6IHN0cmluZywgcGF0dGVybjogJFNPVVJDRSB9IH0gIyBDYXB0dXJlIHNvdXJjZVxuICAgICAgICAgICAgICBzdG9wQnk6IGVuZCAjIFNlYXJjaCBhbmNlc3RvcnMgdG8gZmluZCB0aGUgY29ycmVjdCB2YXJpYWJsZV9kZWNsYXJhdG9yXG4gICAgICAgICAgICBzdG9wQnk6IGVuZCAjIEVuc3VyZSB3ZSBjaGVjayBhbmNlc3RvcnMgZm9yIHRoZSB2YXJpYWJsZV9kZWNsYXJhdG9yXG5cbiAgICAjIERZTkFNSUMgSU1QT1JUUyAoU2lkZSBFZmZlY3QgLyBTb3VyY2UgT25seSkgXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjIGVnOiAocmVxdWlyZSgnU09VUkNFJykpXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAtIGFsbDpcbiAgICAgICAgLSBraW5kOiBzdHJpbmcgIyBUYXJnZXQgdGhlIHNvdXJjZSBzdHJpbmcgbGl0ZXJhbCBkaXJlY3RseVxuICAgICAgICAtIHBhdHRlcm46ICRTT1VSQ0VcbiAgICAgICAgLSBpbnNpZGU6ICMgU3RyaW5nIG11c3QgYmUgdGhlIGFyZ3VtZW50IG9mIHJlcXVpcmUoKSBvciBpbXBvcnQoKVxuICAgICAgICAgICAga2luZDogYXJndW1lbnRzXG4gICAgICAgICAgICBwYXJlbnQ6XG4gICAgICAgICAgICAgIGtpbmQ6IGNhbGxfZXhwcmVzc2lvblxuICAgICAgICAgICAgICBoYXM6XG4gICAgICAgICAgICAgICAgZmllbGQ6IGZ1bmN0aW9uXG4gICAgICAgICAgICAgICAgIyBNYXRjaCAncmVxdWlyZScgaWRlbnRpZmllciBvciAnaW1wb3J0JyBrZXl3b3JkIHVzZWQgZHluYW1pY2FsbHlcbiAgICAgICAgICAgICAgICByZWdleDogJ14ocmVxdWlyZXxpbXBvcnQpJCdcbiAgICAgICAgICAgIHN0b3BCeTogZW5kICMgU2VhcmNoIGFuY2VzdG9ycyBpZiBuZWVkZWQgKGZvciB0aGUgYXJndW1lbnRzL2NhbGxfZXhwcmVzc2lvbilcbiAgICAgICAgLSBub3Q6XG4gICAgICAgICAgICBpbnNpZGU6XG4gICAgICAgICAgICAgIGtpbmQ6IGxleGljYWxfZGVjbGFyYXRpb25cbiAgICAgICAgICAgICAgc3RvcEJ5OiBlbmQgIyBTZWFyY2ggYWxsIGFuY2VzdG9ycyB1cCB0byB0aGUgcm9vdFxuXG4gICAgIyBOQU1FU1BBQ0UgSU1QT1JUUyBcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgZWc6IChpbXBvcnQgKiBhcyBucyBmcm9tICdtb2QnKVxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLSBhbGw6XG4gICAgICAgIC0ga2luZDogaW1wb3J0X3N0YXRlbWVudFxuICAgICAgICAtIGhhczpcbiAgICAgICAgICAgIGtpbmQ6IGltcG9ydF9jbGF1c2VcbiAgICAgICAgICAgIGhhczpcbiAgICAgICAgICAgICAga2luZDogbmFtZXNwYWNlX2ltcG9ydFxuICAgICAgICAgICAgICBoYXM6XG4gICAgICAgICAgICAgICAgIyBuYW1lc3BhY2VfaW1wb3J0J3MgY2hpbGQgaWRlbnRpZmllciBpcyB0aGUgYWxpYXNcbiAgICAgICAgICAgICAgICBraW5kOiBpZGVudGlmaWVyXG4gICAgICAgICAgICAgICAgcGF0dGVybjogJE5BTUVTUEFDRV9BTElBU1xuICAgICAgICAtIGhhczpcbiAgICAgICAgICAgIGZpZWxkOiBzb3VyY2VcbiAgICAgICAgICAgIHBhdHRlcm46ICRTT1VSQ0VcblxuICAgICMgU0lERSBFRkZFQ1QgSU1QT1JUUyBcbiAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgZWc6IChpbXBvcnQgJ21vZCcpXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAtIGFsbDpcbiAgICAgICAgLSBraW5kOiBpbXBvcnRfc3RhdGVtZW50XG4gICAgICAgIC0gbm90OiAjIE11c3QgTk9UIGhhdmUgYW4gaW1wb3J0X2NsYXVzZVxuICAgICAgICAgICAgaGFzOiB7IGtpbmQ6IGltcG9ydF9jbGF1c2UgfVxuICAgICAgICAtIGhhczogIyBCdXQgbXVzdCBoYXZlIGEgc291cmNlXG4gICAgICAgICAgICBmaWVsZDogc291cmNlXG4gICAgICAgICAgICBwYXR0ZXJuOiAkU09VUkNFXG4iLCJzb3VyY2UiOiIvL0B0cy1ub2NoZWNrXG4vLyBOYW1lZCBpbXBvcnRcbmltcG9ydCB7IHRlc3RpbmcgfSBmcm9tICcuL3Rlc3RzJztcblxuLy8gQWxpYXNlZCBpbXBvcnRcbmltcG9ydCB7IHRlc3RpbmcgYXMgdGVzdCB9IGZyb20gJy4vdGVzdHMyJztcblxuLy8gRGVmYXVsdCBpbXBvcnRcbmltcG9ydCBoZWxsbyBmcm9tICdoZWxsb193b3JsZDEnO1xuXG4vLyBOYW1lc3BhY2UgaW1wb3J0XG5pbXBvcnQgKiBhcyBzb21ldGhpbmcgZnJvbSAnaGVsbG9fd29ybGQyJztcblxuLy8gU2lkZS1lZmZlY3QgaW1wb3J0XG5pbXBvcnQgJ0BmYXN0aWZ5L3N0YXRpYyc7XG5cbi8vIFR5cGUgaW1wb3J0XG5pbXBvcnQge3R5cGUgaGVsbG8xMjQzIGFzIHRlc3Rpbmd9IGZyb20gJ2hlbGxvJztcblxuLy8gUmVxdWlyZSBwYXR0ZXJuc1xuY29uc3QgbW9kID0gcmVxdWlyZSgnc29tZS1tb2R1bGUnKTtcbnJlcXVpcmUoJ3BvbHlmaWxsJyk7XG5cbi8vIERlc3RydWN0dXJlZCByZXF1aXJlXG5jb25zdCB7IHRlc3QxMjIsIHRlc3QyIH0gPSByZXF1aXJlKCcuL2Rlc3RydWN0dXJlZDEnKTtcbi8vIEFsaWFzZWQgcmVxdWlyZVxuY29uc3QgeyB0ZXN0MTIyOiB0ZXN0MTIzLCB0ZXN0MjogdGVzdDIzLCB0ZXN0MzogdGVzdDMzIH0gPSByZXF1aXJlKCcuL2Rlc3RydWN0dXJlZDInKTtcblxuLy8gTWl4ZWQgaW1wb3J0c1xuaW1wb3J0IGRlZmF1bHRFeHBvcnQsIHsgbmFtZWRFeHBvcnQgfSBmcm9tICcuL21peGVkJztcbmltcG9ydCBkZWZhdWx0RXhwb3J0MiwgKiBhcyBuYW1lc3BhY2UgZnJvbSAnLi9taXhlZDInO1xuXG5cbi8vIE11bHRpcGxlIGltcG9ydCBsaW5lcyBmcm9tIHRoZSBzYW1lIGZpbGVcbmltcG9ydCB7IG9uZSwgdHdvIGFzIGFsaWFzLCB0aHJlZSB9IGZyb20gJy4vbXVsdGlwbGUnO1xuaW1wb3J0IHsgbmV2ZXIsIGdvbm5hLCBnaXZlLCB5b3UsIHVwIH0gZnJvbSAnLi9tdWx0aXBsZSc7XG5cbi8vIFN0cmluZyBsaXRlcmFsIHZhcmlhdGlvbnNcbmltcG9ydCB7IHRlc3QxIH0gZnJvbSBcIi4vZG91YmxlLXF1b3RlZFwiO1xuaW1wb3J0IHsgdGVzdDIgfSBmcm9tICcuL3NpbmdsZS1xdW90ZWQnO1xuXG4vLyBNdWx0aWxpbmUgaW1wb3J0c1xuaW1wb3J0IHtcbiAgICBsb25nSW1wb3J0MSxcbiAgICBsb25nSW1wb3J0MiBhcyBhbGlhczIsXG4gICAgbG9uZ0ltcG9ydDNcbn0gZnJvbSAnLi9tdWx0aWxpbmUnO1xuXG4vLyBEeW5hbWljIGltcG9ydHNcbmNvbnN0IGR5bmFtaWNNb2R1bGUgPSBpbXBvcnQoJy4vZHluYW1pYzEnKTtcbmNvbnN0IHt0ZXN0aW5nLCB0ZXN0aW5nMTIzfSA9IGltcG9ydCgnLi9keW5hbWljMicpO1xuY29uc3QgYXN5bmNEeW5hbWljTW9kdWxlID0gYXdhaXQgaW1wb3J0KCcuL2FzeW5jX2R5bmFtaWMxJykudGhlbihtb2R1bGUgPT4gbW9kdWxlLmRlZmF1bHQpO1xuLy8gQWxpYXNlZCBkeW5hbWljIGltcG9ydFxuY29uc3QgeyBvcmlnaW5hbElkZW50aWZpZXI6IGFsaWFzZWREeW5hbWljSW1wb3J0fSA9IGF3YWl0IGltcG9ydCgnLi9hc3luY19keW5hbWljMicpO1xuXG4vLyBDb21tZW50cyBpbiBpbXBvcnRzXG5pbXBvcnQgLyogdGVzdCAqLyB7IFxuICAgIC8vIENvbW1lbnQgaW4gaW1wb3J0XG4gICAgY29tbWVudGVkSW1wb3J0IFxufSBmcm9tICcuL2NvbW1lbnRlZCc7IC8vIEVuZCBvZiBsaW5lIGNvbW1lbnQgXG5cblxuIn0=)

### Description

Finding import metadata can be useful. Below is a comprehensive snippet for extracting identifiers from various import statements:

- Alias Imports (`import { hello as world } from './file'`)
- Default & Regular Imports (`import test from './my-test`')
- Dynamic Imports (`require(...)`, and `import(...)`)
- Side Effect & Namespace Imports (`import * as myCode from './code`')

<!-- Use YAML in the example. Delete this section if use pattern. -->

### YAML

```yaml
# find-all-imports-and-identifiers.yaml
id: find-all-imports-and-identifiers
language: TypeScript
rule:
  any:
    # ALIAS IMPORTS
    # ------------------------------------------------------------
    # import { ORIGINAL as ALIAS } from 'SOURCE'
    # ------------------------------------------------------------
    - all:
        # 1. Target the specific node type for named imports
        - kind: import_specifier
        # 2. Ensure it *has* an 'alias' field, capturing the alias identifier
        - has:
            field: alias
            pattern: $ALIAS
        # 3. Capture the original identifier (which has the 'name' field)
        - has:
            field: name
            pattern: $ORIGINAL
        # 4. Find an ANCESTOR import_statement and capture its source path
        - inside:
            stopBy: end # <<<--- Search ancestors.
            kind: import_statement
            has: # Ensure the found import_statement has the source field
              field: source
              pattern: $SOURCE

    # DEFAULT IMPORTS
    # ------------------------------------------------------------
    # import { ORIGINAL } from 'SOURCE'
    # ------------------------------------------------------------
    - all:
        - kind: import_statement
        - has:
            # Ensure it has an import_clause...
            kind: import_clause
            has:
              # ...that directly contains an identifier (the default import name)
              # This identifier is NOT under a 'named_imports' or 'namespace_import' node
              kind: identifier
              pattern: $DEFAULT_NAME
        - has:
            field: source
            pattern: $SOURCE

    # REGULAR IMPORTS
    # ------------------------------------------------------------
    # import { ORIGINAL } from 'SOURCE'
    # ------------------------------------------------------------
    - all:
        # 1. Target the specific node type for named imports
        - kind: import_specifier
        # 2. Ensure it *has* an 'alias' field, capturing the alias identifier
        - has:
            field: name
            pattern: $ORIGINAL
        # 4. Find an ANCESTOR import_statement and capture its source path
        - inside:
            stopBy: end # <<<--- This is the key fix! Search ancestors.
            kind: import_statement
            has: # Ensure the found import_statement has the source field
              field: source
              pattern: $SOURCE

    # DYNAMIC IMPORTS (Single Variable Assignment)
    # ------------------------------------------------------------
    # const VAR_NAME = require('SOURCE')
    # ------------------------------------------------------------
    - all:
        - kind: variable_declarator
        - has:
            field: name
            kind: identifier
            pattern: $VAR_NAME # Capture the single variable name
        - has:
            field: value
            any:
              # Direct call
              - all: # Wrap conditions in all
                  - kind: call_expression
                  - has: { field: function, regex: "^(require|import)$" }
                  - has: {
                      field: arguments,
                      has: { kind: string, pattern: $SOURCE },
                    } # Capture source
              # Awaited call
              - kind: await_expression
                has:
                  all: # Wrap conditions in all
                    - kind: call_expression
                    - has: { field: function, regex: "^(require|import)$" }
                    - has: {
                        field: arguments,
                        has: { kind: string, pattern: $SOURCE },
                      } # Capture source

    # DYNAMIC IMPORTS (Destructured Shorthand Assignment)
    # ------------------------------------------------------------
    # const { ORIGINAL } = require('SOURCE')
    # ------------------------------------------------------------
    - all:
        # 1. Target the shorthand identifier within the pattern
        - kind: shorthand_property_identifier_pattern
        - pattern: $ORIGINAL
        # 2. Ensure it's inside an object_pattern that is the name of a variable_declarator
        - inside:
            kind: object_pattern
            inside: # Check the variable_declarator it belongs to
              kind: variable_declarator
              # 3. Check the value assigned by the variable_declarator
              has:
                field: value
                any:
                  # Direct call
                  - all:
                      - kind: call_expression
                      - has: { field: function, regex: "^(require|import)$" }
                      - has: {
                          field: arguments,
                          has: { kind: string, pattern: $SOURCE },
                        } # Capture source
                  # Awaited call
                  - kind: await_expression
                    has:
                      all:
                        - kind: call_expression
                        - has: { field: function, regex: "^(require|import)$" }
                        - has: {
                            field: arguments,
                            has: { kind: string, pattern: $SOURCE },
                          } # Capture source
              stopBy: end # Search ancestors to find the correct variable_declarator

    # DYNAMIC IMPORTS (Destructured Alias Assignment)
    # ------------------------------------------------------------
    # const { ORIGINAL: ALIAS } = require('SOURCE')
    # ------------------------------------------------------------
    - all:
        # 1. Target the pair_pattern for aliased destructuring
        - kind: pair_pattern
        # 2. Capture the original identifier (key)
        - has:
            field: key
            kind: property_identifier # Could be string/number literal too, but property_identifier is common
            pattern: $ORIGINAL
        # 3. Capture the alias identifier (value)
        - has:
            field: value
            kind: identifier
            pattern: $ALIAS
        # 4. Ensure it's inside an object_pattern that is the name of a variable_declarator
        - inside:
            kind: object_pattern
            inside: # Check the variable_declarator it belongs to
              kind: variable_declarator
              # 5. Check the value assigned by the variable_declarator
              has:
                field: value
                any:
                  # Direct call
                  - all:
                      - kind: call_expression
                      - has: { field: function, regex: "^(require|import)$" }
                      - has: {
                          field: arguments,
                          has: { kind: string, pattern: $SOURCE },
                        } # Capture source
                  # Awaited call
                  - kind: await_expression
                    has:
                      all:
                        - kind: call_expression
                        - has: { field: function, regex: "^(require|import)$" }
                        - has: {
                            field: arguments,
                            has: { kind: string, pattern: $SOURCE },
                          } # Capture source
              stopBy: end # Search ancestors to find the correct variable_declarator
            stopBy: end # Ensure we check ancestors for the variable_declarator

    # DYNAMIC IMPORTS (Side Effect / Source Only)
    # ------------------------------------------------------------
    # require('SOURCE')
    # ------------------------------------------------------------
    - all:
        - kind: string # Target the source string literal directly
        - pattern: $SOURCE
        - inside: # String must be the argument of require() or import()
            kind: arguments
            parent:
              kind: call_expression
              has:
                field: function
                # Match 'require' identifier or 'import' keyword used dynamically
                regex: "^(require|import)$"
            stopBy: end # Search ancestors if needed (for the arguments/call_expression)
        - not:
            inside:
              kind: lexical_declaration
              stopBy: end # Search all ancestors up to the root

    # NAMESPACE IMPORTS
    # ------------------------------------------------------------
    # import * as ns from 'mod'
    # ------------------------------------------------------------
    - all:
        - kind: import_statement
        - has:
            kind: import_clause
            has:
              kind: namespace_import
              has:
                # namespace_import's child identifier is the alias
                kind: identifier
                pattern: $NAMESPACE_ALIAS
        - has:
            field: source
            pattern: $SOURCE

    # SIDE EFFECT IMPORTS
    # ------------------------------------------------------------
    # import 'mod'
    # ------------------------------------------------------------
    - all:
        - kind: import_statement
        - not: # Must NOT have an import_clause
            has: { kind: import_clause }
        - has: # But must have a source
            field: source
            pattern: $SOURCE
```

### Example

<!-- highlight matched code in curly-brace {lineNum} -->

```ts {60}
// @ts-nocheck
// Named import
import { testing } from './tests'

// Aliased import
import { testing as test } from './tests2'

// Default import
import hello from 'hello_world1'

// Namespace import
import * as something from 'hello_world2'

// Side-effect import
import '@fastify/static'

// Type import
import { type hello1243 as testing } from 'hello'

// Require patterns
const mod = require('some-module')
require('polyfill')

// Destructured require
const { test122, test2 } = require('./destructured1')
// Aliased require
const { test122: test123, test2: test23, test3: test33 } = require('./destructured2')

// Mixed imports
import defaultExport, { namedExport } from './mixed'
import defaultExport2, * as namespace from './mixed2'

// Multiple import lines from the same file
import { one, three, two as alias } from './multiple'
import { give, gonna, never, up, you } from './multiple'

// String literal variations
import { test1 } from './double-quoted'
import { test2 } from './single-quoted'

// Multiline imports
import { longImport1, longImport2 as alias2, longImport3 } from './multiline'

// Dynamic imports
const dynamicModule = import('./dynamic1')
const { testing, testing123 } = import('./dynamic2')
const asyncDynamicModule = await import('./async_dynamic1').then(module => module.default)
// Aliased dynamic import
const { originalIdentifier: aliasedDynamicImport } = await import('./async_dynamic2')

// Comments in imports
import /* test */ {
  // Comment in import
  commentedImport,
} from './commented' // End of line comment
```

### Contributed by

[Michael Angelo Rivera](https://github.com/michaelangeloio)
