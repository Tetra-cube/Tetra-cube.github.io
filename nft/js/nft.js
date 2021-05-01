$(document).ready(function () {
	var id, url, paramsString;
	try {
		paramsString = new URLSearchParams(window.location.search).get("s");
		let	params = atob(paramsString).split("|lazy-split|");
		if (params.length != 2)
			throw "invalid"
		id = params[0].split("").reverse().join("");
		url = params[1].split("").reverse().join("");
		if (!urlRegex.test(url))
			throw "invalid"
	}
	catch {
		$("title").text("Invalid NFT");
		$("#header").text("Invalid NFT");
		$("#link").css("display", "none");
		return;
	}
	$("title").text(id);
	$("#header").text(id);
	$("#link").attr("href", url);
	$("#nft-value-number").html(getNftValue(paramsString));
});