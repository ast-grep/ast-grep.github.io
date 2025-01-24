// console.log() will be matched by pattern!
// click diff tab to see rewrite.

function tryAstGrep() {
  console.log('matched in metavar!')
}

const multiLineExpression =
  console
   .log('Also matched!')

if (true) {
  const notThis = 'console.log("not me")'
} else {
  console.debug('matched by YAML')
}
