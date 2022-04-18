const date1 = new Date(2022, 04, 28);
const date2 = new Date(2022, 07, 23);
console.log(date1);
console.log(date2);


var Difference_In_Time = date2.getTime() - date1.getTime();
  
// To calculate the no. of days between two dates
var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
  
console.log(Difference_In_Days);