export function sendDevMessages() {
  $.getJSON('https://raw.githubusercontent.com/pwatson100/symbaroum/master/msgdata/data.json', function (data) {
    console.log(data);
  });
}
