function getNftValue(string) {
	let number = 100;
	for(counter = 0; counter < string.length; counter++)
		number += string.charCodeAt(counter);
	return (number % 90) / 10 + 1;
}