


function sum(a,b){
    if (a&b) return a+b 
    console.log("same");
    return function(b) {
        return a+b;
    }
}


console.log(sum(8,9));
console.log(sum(8)(9));