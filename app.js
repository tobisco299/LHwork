const subimit = document.getElementById('submit');
const input = document.getElementById('input');
const result = document.getElementById('result');

const myObject = {
  "Tobi Adeoye": "I love beef!",
  "John Wale": "I hate beef!",
  "Kemi Adeosun": "Loves smileling",
  "Steve Ogunyemi": "Always a good cook",
  "Emmanuel Ayodele": "Loves reading books",
}
//object of arrays
myObject1 = {
  "name": "Tobi Adeoye",
  "sex": "Male",
  "age": 25,
  "hobbies": "traveling"
  },
  {
  "name": "John Wale",
  "sex": "Male",
  "age": 26,
  "hobbies": "reading"
  },
  {
  "name": "Kemi Adeosun",
  "sex": "Female",
  "age": 24,
  "hobbies": "swimming"
  },
  {
  "name": "Steve Ogunyemi",
  "sex": "Male",
  "age": 27,
  "hobbies": "cooking"
  },
  {
  "name": "Emmanuel Ayodele",
  "sex": "Male",
  "age": 25,
  "hobbies": "reading"
  }

subimit.addEventListener('click', function() {
   data = input.value;
    result.innerHTML = myObject[data];

});
